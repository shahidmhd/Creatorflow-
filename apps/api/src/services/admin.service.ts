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

  async getRevenueAnalytics(timeframe = "monthly") {
    const [rewards, campaigns, creditedAgg, totalCampaignFundAgg] = await Promise.all([
      prisma.reward.findMany({
        where: { status: "CREDITED" },
        include: {
          campaign: {
            include: {
              creator: { select: { id: true, name: true, username: true, email: true } },
            },
          },
          editor: { select: { id: true, name: true, username: true, email: true } },
        },
        orderBy: { creditedAt: "desc" },
      }),
      prisma.campaign.findMany({
        select: {
          id: true,
          title: true,
          status: true,
          campaignFund: true,
          rewardAmount: true,
          platformFee: true,
          createdAt: true,
          creator: { select: { id: true, name: true, username: true } },
        },
      }),
      prisma.reward.aggregate({
        where: { status: "CREDITED" },
        _sum: { grossAmount: true, platformFee: true, netAmount: true },
        _count: true,
      }),
      prisma.campaign.aggregate({
        _sum: { campaignFund: true },
      }),
    ]);

    const totalGMV = totalCampaignFundAgg._sum.campaignFund ?? 0;
    const totalPlatformFees = creditedAgg._sum.platformFee ?? 0;
    const totalDisbursedToEditors = creditedAgg._sum.netAmount ?? 0;
    const totalDisbursedGross = creditedAgg._sum.grossAmount ?? 0;
    const pendingEscrow = Math.max(0, totalGMV - totalDisbursedGross);

    const now = new Date();
    const tf = timeframe.toLowerCase();

    interface Bucket {
      key: string;
      label: string;
      startDate: Date;
      endDate: Date;
      gross: number;
      platformFee: number;
      netPayout: number;
      transactions: number;
    }

    const chartBuckets: Bucket[] = [];

    if (tf === "daily") {
      for (let i = 6; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);

        const endD = new Date(d);
        endD.setHours(23, 59, 59, 999);

        const label = d.toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short" });
        chartBuckets.push({
          key: d.toISOString().split("T")[0],
          label,
          startDate: d,
          endDate: endD,
          gross: 0,
          platformFee: 0,
          netPayout: 0,
          transactions: 0,
        });
      }
    } else if (tf === "weekly") {
      for (let i = 7; i >= 0; i--) {
        const start = new Date(now);
        start.setDate(start.getDate() - i * 7 - ((start.getDay() + 6) % 7));
        start.setHours(0, 0, 0, 0);

        const end = new Date(start);
        end.setDate(end.getDate() + 6);
        end.setHours(23, 59, 59, 999);

        const label = `Wk ${start.toLocaleDateString("en-US", { day: "numeric", month: "short" })}`;
        chartBuckets.push({
          key: `w-${i}-${start.toISOString().split("T")[0]}`,
          label,
          startDate: start,
          endDate: end,
          gross: 0,
          platformFee: 0,
          netPayout: 0,
          transactions: 0,
        });
      }
    } else if (tf === "yearly") {
      const currentYear = now.getFullYear();
      for (let yr = currentYear - 4; yr <= currentYear; yr++) {
        const start = new Date(yr, 0, 1, 0, 0, 0, 0);
        const end = new Date(yr, 11, 31, 23, 59, 59, 999);
        chartBuckets.push({
          key: `yr-${yr}`,
          label: String(yr),
          startDate: start,
          endDate: end,
          gross: 0,
          platformFee: 0,
          netPayout: 0,
          transactions: 0,
        });
      }
    } else {
      // Monthly or all-time (12 months)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const endD = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59, 999);
        const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
        chartBuckets.push({
          key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
          label,
          startDate: d,
          endDate: endD,
          gross: 0,
          platformFee: 0,
          netPayout: 0,
          transactions: 0,
        });
      }
    }

    rewards.forEach((r) => {
      const date = r.creditedAt ? new Date(r.creditedAt) : new Date(r.createdAt);
      for (const bucket of chartBuckets) {
        if (date >= bucket.startDate && date <= bucket.endDate) {
          bucket.gross += r.grossAmount;
          bucket.platformFee += r.platformFee;
          bucket.netPayout += r.netAmount;
          bucket.transactions += 1;
          break;
        }
      }
    });

    const periodStart = chartBuckets.length > 0 ? chartBuckets[0].startDate : new Date(0);
    const periodEnd = chartBuckets.length > 0 ? chartBuckets[chartBuckets.length - 1].endDate : new Date();

    const periodRewards = rewards.filter((r) => {
      const d = r.creditedAt ? new Date(r.creditedAt) : new Date(r.createdAt);
      return d >= periodStart && d <= periodEnd;
    });

    const periodGMV = periodRewards.reduce((sum, r) => sum + r.grossAmount, 0);
    const periodPlatformFees = periodRewards.reduce((sum, r) => sum + r.platformFee, 0);
    const periodDisbursed = periodRewards.reduce((sum, r) => sum + r.netAmount, 0);
    const periodTransactionsCount = periodRewards.length;
    const averageTransactionFee = periodTransactionsCount > 0
      ? Math.round(periodPlatformFees / periodTransactionsCount)
      : 0;

    const campaignRevenueMap = new Map<string, { id: string; title: string; creatorName: string; totalRevenue: number; totalDisbursed: number; transactionCount: number }>();
    rewards.forEach((r) => {
      const cId = r.campaignId;
      const existing = campaignRevenueMap.get(cId) ?? {
        id: cId,
        title: r.campaign?.title ?? "Campaign",
        creatorName: r.campaign?.creator?.name ?? "Creator",
        totalRevenue: 0,
        totalDisbursed: 0,
        transactionCount: 0,
      };
      existing.totalRevenue += r.platformFee;
      existing.totalDisbursed += r.netAmount;
      existing.transactionCount += 1;
      campaignRevenueMap.set(cId, existing);
    });

    const topCampaigns = Array.from(campaignRevenueMap.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, 5);

    const transactions = rewards.map((r) => ({
      id: r.id,
      campaignId: r.campaignId,
      campaignTitle: r.campaign?.title ?? "Unknown Campaign",
      campaignCategory: r.campaign?.category ?? "General",
      platform: r.campaign?.socialPlatform ?? "Instagram",
      creatorName: r.campaign?.creator?.name ?? "Unknown Creator",
      creatorUsername: r.campaign?.creator?.username ?? "creator",
      editorId: r.editorId,
      editorName: r.editor?.name ?? "Unknown Editor",
      editorUsername: r.editor?.username ?? "editor",
      verifiedViews: r.verifiedViews,
      grossAmount: r.grossAmount,
      platformFee: r.platformFee,
      netAmount: r.netAmount,
      feePercentage: r.feePercentage,
      status: r.status,
      creditedAt: (r.creditedAt ?? r.createdAt).toISOString(),
    }));

    return {
      summary: {
        totalGMV,
        totalPlatformFees,
        totalDisbursedToEditors,
        pendingEscrow,
        takeRate: 15,
        timeframe: tf,
        periodGMV,
        periodPlatformFees,
        periodDisbursed,
        periodTransactionsCount,
        averageTransactionFee,
      },
      chartData: chartBuckets.map((b) => ({
        key: b.key,
        label: b.label,
        gross: b.gross,
        platformFee: b.platformFee,
        netPayout: b.netPayout,
        transactions: b.transactions,
      })),
      transactions,
      topCampaigns,
    };
  },
};
