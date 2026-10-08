import { prisma } from "../repositories/prisma";
import { config } from "../config";
import { NotFoundError } from "../errors";

export const adminService = {
  async getStats() {
    const [users, campaigns, rewards, wallets] = await Promise.all([
      prisma.user.count(),
      prisma.campaign.groupBy({ by: ["status"], _count: true }),
      prisma.reward.groupBy({ by: ["status"], _count: true }),
      prisma.wallet.aggregate({ _sum: { balance: true } }),
    ]);
    return { users, campaigns, rewards, totalWalletBalance: wallets._sum.balance ?? 0 };
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
        include: { creator: { select: { id: true, name: true } }, _count: { select: { applications: true, submissions: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count(),
    ]);
    return { campaigns, total, page, limit };
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
