import { prisma } from "../repositories/prisma";
import { config } from "../config";
import { NotFoundError } from "../errors";
import { CampaignStatus } from "@prisma/client";
import { auditLogService } from "./audit-log.service";

export const adminService = {
  async getStats() {
    const [
      users,
      usersByRole,
      campaigns,
      rewards,
      wallets,
      campaignFundSum,
      platformFeeSum,
      disbursedSum,
      totalSubmissions,
      totalPublishedPosts,
      pendingReports,
      recentCampaigns,
      recentLogs,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.groupBy({ by: ["role"], _count: true }),
      prisma.campaign.groupBy({ by: ["status"], _count: true }),
      prisma.reward.groupBy({ by: ["status"], _count: true }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
      prisma.campaign.aggregate({ _sum: { campaignFund: true } }),
      prisma.reward.aggregate({ _sum: { platformFee: true }, where: { status: "CREDITED" } }),
      prisma.reward.aggregate({ _sum: { netAmount: true }, where: { status: "CREDITED" } }),
      prisma.contentSubmission.count(),
      prisma.publishedPost.count(),
      prisma.report.count({ where: { resolved: false } }),
      prisma.campaign.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          creator: { select: { id: true, name: true, username: true } },
          _count: { select: { applications: true, submissions: true } },
        },
      }),
      prisma.auditLog.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        include: { actor: { select: { id: true, name: true, role: true } } },
      }),
    ]);

    const activeCampaignsCount = campaigns.find((c) => c.status === "PUBLISHED")?._count ?? 0;
    const completedCampaignsCount = campaigns.find((c) => c.status === "COMPLETED")?._count ?? 0;
    const pausedCampaignsCount = campaigns.find((c) => c.status === "PAUSED")?._count ?? 0;
    const draftCampaignsCount = campaigns.find((c) => c.status === "DRAFT")?._count ?? 0;
    const totalCampaignsCount = campaigns.reduce((acc, c) => acc + c._count, 0);

    return {
      users,
      usersByRole,
      campaigns,
      rewards,
      totalCampaigns: totalCampaignsCount,
      activeCampaigns: activeCampaignsCount,
      completedCampaigns: completedCampaignsCount,
      pausedCampaigns: pausedCampaignsCount,
      draftCampaigns: draftCampaignsCount,
      totalWalletBalance: wallets._sum.balance ?? 0,
      totalGMV: campaignFundSum._sum.campaignFund ?? 0,
      totalPlatformFeesEarned: platformFeeSum._sum.platformFee ?? 0,
      totalDisbursedToEditors: disbursedSum._sum.netAmount ?? 0,
      totalSubmissions,
      totalPublishedPosts,
      pendingReports,
      recentCampaigns,
      recentLogs,
    };
  },

  async getUsers(page = 1, limit = 20, role?: string) {
    const where = role ? { role: role as never } : {};
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, name: true, username: true, email: true, role: true, isActive: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.user.count({ where }),
    ]);
    return { users, total, page, limit };
  },

  async toggleUserActive(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError("User");
    return prisma.user.update({ where: { id: userId }, data: { isActive: !user.isActive } });
  },

  async getAllCampaigns(page = 1, limit = 20) {
    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        include: {
          creator: { select: { id: true, name: true, username: true, email: true } },
          _count: { select: { applications: true, submissions: true } },
          rewards: { select: { grossAmount: true, netAmount: true, platformFee: true, status: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count(),
    ]);
    return { campaigns, total, page, limit };
  },

  async updateCampaignStatus(campaignId: string, status: CampaignStatus) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    const updated = await prisma.campaign.update({
      where: { id: campaignId },
      data: { status },
      include: {
        creator: { select: { id: true, name: true } },
        _count: { select: { applications: true, submissions: true } },
      },
    });
    await auditLogService.log(null, "ADMIN_CAMPAIGN_STATUS_CHANGED", "Campaign", campaignId, { status: campaign.status }, { status });
    return updated;
  },

  async getAllRewards(page = 1, limit = 20) {
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        include: {
          campaign: { select: { title: true } },
          editor: { select: { name: true, username: true } },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reward.count(),
    ]);
    return { rewards, total, page, limit };
  },

  async getSetting(key: string): Promise<string> {
    const setting = await prisma.adminSetting.findUnique({ where: { key } });
    if (!setting) {
      // Return defaults
      if (key === "platformFeePercentage") return String(config.defaults.platformFeePercentage);
      throw new NotFoundError(`Setting "${key}"`);
    }
    return setting.value;
  },

  async setSetting(key: string, value: string) {
    return prisma.adminSetting.upsert({
      where: { key },
      create: { key, value },
      update: { value },
    });
  },

  async getAllSettings() {
    return prisma.adminSetting.findMany({ orderBy: { key: "asc" } });
  },

  async getReports(page = 1, limit = 20) {
    const [reports, total] = await Promise.all([
      prisma.report.findMany({
        include: { reporter: { select: { id: true, name: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.report.count(),
    ]);
    return { reports, total, page, limit };
  },

  async resolveReport(id: string) {
    return prisma.report.update({
      where: { id },
      data: { resolved: true, resolvedAt: new Date() },
    });
  },
};
