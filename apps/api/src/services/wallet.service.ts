import { WalletTransactionType } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError } from "../errors";

export const walletService = {
  async getByUserId(userId: string) {
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      include: { transactions: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
    if (!wallet) throw new NotFoundError("Wallet");
    return wallet;
  },

  async getBalance(userId: string): Promise<number> {
    const wallet = await prisma.wallet.findUnique({ where: { userId }, select: { balance: true } });
    if (!wallet) throw new NotFoundError("Wallet");
    return wallet.balance;
  },

  /**
   * Credit reward to editor wallet atomically.
   * Creates two ledger entries:
   *   1. REWARD (+netAmount) credited to editor wallet
   *   2. PLATFORM_FEE (platformFee) recorded on editor wallet as an informational entry
   */
  async creditReward(
    editorUserId: string,
    rewardId: string,
    netAmount: number,
    platformFee: number,
    campaignTitle: string
  ) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId: editorUserId } });
      if (!wallet) throw new NotFoundError("Wallet");

      const newBalance = wallet.balance + netAmount;

      // Update wallet balance
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      // REWARD transaction (credit to editor)
      const rewardTx = await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.REWARD,
          amount: netAmount,
          balance: newBalance,
          description: `Reward credited for campaign "${campaignTitle}"`,
          referenceId: rewardId,
        },
      });

      // PLATFORM_FEE transaction (platform ledger — stored against wallet for audit purposes)
      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.PLATFORM_FEE,
          amount: platformFee,
          balance: newBalance, // balance after REWARD credit (fee already deducted from gross)
          description: `Platform fee for campaign "${campaignTitle}"`,
          referenceId: rewardId,
        },
      });

      return { rewardTx, newBalance };
    });
  },

  async createAdjustment(userId: string, amount: number, description: string) {
    return prisma.$transaction(async (tx) => {
      const wallet = await tx.wallet.findUnique({ where: { userId } });
      if (!wallet) throw new NotFoundError("Wallet");

      const newBalance = wallet.balance + amount;
      await tx.wallet.update({ where: { id: wallet.id }, data: { balance: newBalance } });

      return tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: WalletTransactionType.ADJUSTMENT,
          amount,
          balance: newBalance,
          description,
        },
      });
    });
  },

  async getTransactions(userId: string, page = 1, limit = 20) {
    const wallet = await prisma.wallet.findUnique({ where: { userId }, select: { id: true } });
    if (!wallet) throw new NotFoundError("Wallet");

    const [transactions, total] = await Promise.all([
      prisma.walletTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.walletTransaction.count({ where: { walletId: wallet.id } }),
    ]);
    return { transactions, total, page, limit };
  },
};
