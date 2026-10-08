import { RewardStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { calculatePlatformFee } from "../utils/money";
import { walletService } from "./wallet.service";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";
import { config } from "../config";

/**
 * Reward processor interface — isolated so a future Razorpay
 * settlement implementation can replace VirtualWalletRewardProcessor.
 */
export interface IRewardProcessor {
  processReward(params: {
    rewardId: string;
    editorUserId: string;
    netAmount: number;
    platformFee: number;
    campaignTitle: string;
  }): Promise<void>;
  reverseReward(rewardId: string, editorUserId: string): Promise<void>;
}

class VirtualWalletRewardProcessor implements IRewardProcessor {
  async processReward(params: {
    rewardId: string;
    editorUserId: string;
    netAmount: number;
    platformFee: number;
    campaignTitle: string;
  }) {
    await walletService.creditReward(
      params.editorUserId,
      params.rewardId,
      params.netAmount,
      params.platformFee,
      params.campaignTitle
    );
  }

  async reverseReward(rewardId: string, editorUserId: string) {
    await walletService.createAdjustment(
      editorUserId,
      0, // Amount will be looked up from reward
      `Reward reversal for reward ${rewardId}`
    );
  }
}

const processor: IRewardProcessor = new VirtualWalletRewardProcessor();

async function getFeePercentage(): Promise<number> {
  const setting = await prisma.adminSetting.findUnique({
    where: { key: "platformFeePercentage" },
  });
  if (!setting) return config.defaults.platformFeePercentage;
  const parsed = parseInt(setting.value, 10);
  return isNaN(parsed) ? config.defaults.platformFeePercentage : parsed;
}

export const rewardService = {
  async createPending(
    publishedPostId: string,
    campaignId: string,
    editorId: string,
    amountOrViews: number,
    options?: { isViews?: boolean }
  ) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");

    const feePercentage = campaign.platformFeePercentage ?? (await getFeePercentage());

    let verifiedViews = 0;
    let calculatedAmount = 0;
    let grossAmount = 0;
    let platformFee = 0;
    let netAmount = 0;

    if (options?.isViews && (campaign.earningPer1000Views > 0 || verifiedViews > 0)) {
      verifiedViews = Math.max(0, amountOrViews);
      const maxEarning = campaign.maximumEditorEarning > 0
        ? campaign.maximumEditorEarning
        : Math.floor((campaign.editorRewardPool || campaign.rewardAmount) / (campaign.editorSlots || 1));

      const rate = campaign.earningPer1000Views > 0
        ? campaign.earningPer1000Views
        : (campaign.minimumViews > 0
            ? Math.floor(maxEarning / (campaign.minimumViews / 1000))
            : Math.floor(maxEarning / 10));

      const { earningsCalculationService } = await import("./earnings-calculation.service");
      const earningResult = earningsCalculationService.calculateEditorEarning({
        verifiedViews,
        earningPer1000ViewsMinor: rate,
        maximumEditorEarningMinor: maxEarning,
      });

      calculatedAmount = earningResult.calculatedEarningMinor;
      netAmount = earningResult.finalEarningMinor;
      platformFee = feePercentage > 0 && feePercentage < 100
        ? Math.floor((netAmount * feePercentage) / (100 - feePercentage))
        : 0;
      grossAmount = netAmount + platformFee;
    } else {
      // Direct amount passed or flat campaign reward completion
      grossAmount = campaign.rewardAmount || campaign.campaignFund || amountOrViews;
      const feeResult = calculatePlatformFee(grossAmount, feePercentage);
      platformFee = feeResult.platformFee;
      netAmount = feeResult.netAmount;
      calculatedAmount = netAmount;
      verifiedViews = campaign.minimumViews || 0;
    }

    const reward = await prisma.reward.create({
      data: {
        publishedPostId,
        campaignId,
        editorId,
        verifiedViews,
        calculatedAmount,
        grossAmount,
        platformFee,
        netAmount,
        feePercentage,
        status: RewardStatus.PENDING,
      },
    });

    await auditLogService.log(null, "REWARD_CREATED", "Reward", reward.id, null, {
      grossAmount,
      platformFee,
      netAmount,
      verifiedViews,
    });
    return reward;
  },

  async updateViews(id: string, creatorId: string, verifiedViews: number) {
    const reward = await this.findById(id);
    if (reward.campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (reward.status !== RewardStatus.PENDING) {
      throw new ConflictError("Can only update views for pending rewards");
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: reward.campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");

    const feePercentage = campaign.platformFeePercentage ?? (await getFeePercentage());
    const maxEarning = campaign.maximumEditorEarning > 0
      ? campaign.maximumEditorEarning
      : Math.floor((campaign.editorRewardPool || campaign.rewardAmount) / (campaign.editorSlots || 1));

    const rate = campaign.earningPer1000Views > 0
      ? campaign.earningPer1000Views
      : (campaign.minimumViews > 0
          ? Math.floor(maxEarning / (campaign.minimumViews / 1000))
          : Math.floor(maxEarning / 10));

    const { earningsCalculationService } = await import("./earnings-calculation.service");
    const earningResult = earningsCalculationService.calculateEditorEarning({
      verifiedViews: Math.max(0, verifiedViews),
      earningPer1000ViewsMinor: rate,
      maximumEditorEarningMinor: maxEarning,
    });

    const netAmount = earningResult.finalEarningMinor;
    const platformFee = feePercentage > 0 && feePercentage < 100
      ? Math.floor((netAmount * feePercentage) / (100 - feePercentage))
      : 0;
    const grossAmount = netAmount + platformFee;

    const updated = await prisma.reward.update({
      where: { id },
      data: {
        verifiedViews: Math.max(0, verifiedViews),
        calculatedAmount: earningResult.calculatedEarningMinor,
        netAmount,
        platformFee,
        grossAmount,
      },
    });

    return updated;
  },

  async findById(id: string) {
    const reward = await prisma.reward.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, title: true, creatorId: true } },
        editor: { select: { id: true, name: true, username: true } },
        publishedPost: true,
      },
    });
    if (!reward) throw new NotFoundError("Reward");
    return reward;
  },

  async findByEditor(editorId: string, page = 1, limit = 20) {
    const [rewards, total] = await Promise.all([
      prisma.reward.findMany({
        where: { editorId },
        include: { campaign: { select: { title: true } } },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.reward.count({ where: { editorId } }),
    ]);
    return { rewards, total, page, limit };
  },

  async approve(id: string, creatorId: string) {
    const reward = await this.findById(id);
    if (reward.campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (reward.status !== RewardStatus.PENDING) {
      throw new ConflictError(`Reward is already ${reward.status}`);
    }

    // Atomic conditional update: only 1 concurrent process can flip status from PENDING
    const result = await prisma.reward.updateMany({
      where: { id, status: RewardStatus.PENDING },
      data: { status: RewardStatus.APPROVED },
    });

    if (result.count === 0) {
      throw new ConflictError("Reward has already been approved or processed");
    }

    // Process payment via the reward processor
    await processor.processReward({
      rewardId: id,
      editorUserId: reward.editorId,
      netAmount: reward.netAmount,
      platformFee: reward.platformFee,
      campaignTitle: reward.campaign.title,
    });

    // Mark as CREDITED
    const updated = await prisma.reward.update({
      where: { id },
      data: { status: RewardStatus.CREDITED, creditedAt: new Date() },
    });

    await notificationService.create(
      reward.editorId,
      "REWARD_CREDITED",
      "Reward Credited",
      `₹${(reward.netAmount / 100).toLocaleString("en-IN")} has been credited to your wallet for "${reward.campaign.title}"`
    );
    await auditLogService.log(creatorId, "REWARD_APPROVED_AND_CREDITED", "Reward", id, { status: "PENDING" }, { status: "CREDITED" });
    return updated;
  },

  async cancel(id: string, actorId: string) {
    const reward = await this.findById(id);
    if (reward.status === RewardStatus.CREDITED) {
      throw new ConflictError("Cannot cancel a credited reward");
    }

    const updated = await prisma.reward.update({
      where: { id },
      data: { status: RewardStatus.CANCELLED },
    });

    await notificationService.create(
      reward.editorId,
      "REWARD_CANCELLED",
      "Reward Cancelled",
      `Your reward for "${reward.campaign.title}" was cancelled`
    );
    await auditLogService.log(actorId, "REWARD_CANCELLED", "Reward", id, { status: reward.status }, { status: "CANCELLED" });
    return updated;
  },
};
