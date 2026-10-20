import { CampaignStatus, ApplicationStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";
import { earningsCalculationService } from "./earnings-calculation.service";
import { walletService } from "./wallet.service";

const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: [CampaignStatus.PUBLISHED, CampaignStatus.CANCELLED],
  PUBLISHED: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
  PAUSED: [CampaignStatus.PUBLISHED, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
  COMPLETED: [CampaignStatus.PUBLISHED],
  CANCELLED: [],
};

export const campaignService = {
  async create(creatorId: string, data: {
    title: string;
    description: string;
    category: string;
    socialPlatform: "Instagram" | "YouTube" | string;
    campaignFund?: number;
    rewardAmount?: number;
    editorSlots?: number;
    earningPer1000Views?: number;
    minimumViews?: number;
    platformFeePercentage?: number;
    maxEarn?: number;
    videoUrl?: string;
    currency?: string;
    deadline: Date;
    thumbnail?: string;
    contentRequirements?: string;
    captionRequirements?: string;
    hashtagRequirements?: string;
    mentionRequirements?: string;
    minimumEngagement?: number;
    additionalInstructions?: string;
  }) {
    const fund = data.campaignFund ?? data.rewardAmount;
    if (!fund || fund <= 0) {
      throw new ConflictError("Campaign fund must be specified and greater than 0");
    }

    const slots = data.editorSlots && data.editorSlots > 0 ? data.editorSlots : 1;
    const feePercentage = data.platformFeePercentage ?? 15;

    // Check creator's wallet balance before creating campaign
    const wallet = await walletService.getByUserId(creatorId);
    if (wallet.balance < fund) {
      const avail = (wallet.balance / 100).toLocaleString("en-IN");
      const req = (fund / 100).toLocaleString("en-IN");
      throw new ConflictError(
        `Insufficient wallet balance. Your available balance is ₹${avail}, but funding this campaign requires ₹${req}. Please add funds to your wallet to launch this campaign.`
      );
    }

    // Authoritative calculation of campaign financial pool & editor caps
    const financials = earningsCalculationService.calculateCampaignFinancials({
      campaignFundMinor: fund,
      platformFeePercentage: feePercentage,
      editorSlots: slots,
    });

    // Derive or validate earning rate per 1,000 views
    let earningRate = data.earningPer1000Views;
    if (!earningRate || earningRate <= 0) {
      const minViews = data.minimumViews && data.minimumViews > 0 ? data.minimumViews : 10000;
      earningRate = Math.floor(financials.maximumEditorEarningMinor / (minViews / 1000));
      if (earningRate <= 0) earningRate = 1;
    }

    // Deduct escrow atomically with campaign creation
    const campaign = await prisma.$transaction(async (tx) => {
      const newBalance = wallet.balance - fund;
      await tx.wallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.walletTransaction.create({
        data: {
          walletId: wallet.id,
          type: "ADJUSTMENT",
          amount: -fund,
          balance: newBalance,
          description: `Campaign escrow reserved for "${data.title}"`,
        },
      });

      return tx.campaign.create({
        data: {
          title: data.title,
          description: data.description,
          category: data.category,
          socialPlatform: data.socialPlatform,
          videoUrl: data.videoUrl,
          currency: data.currency ?? "INR",
          deadline: data.deadline,
          thumbnail: data.thumbnail,
          contentRequirements: data.contentRequirements,
          captionRequirements: data.captionRequirements,
          hashtagRequirements: data.hashtagRequirements,
          mentionRequirements: data.mentionRequirements,
          minimumViews: data.minimumViews ?? 0,
          minimumEngagement: data.minimumEngagement ?? 0,
          additionalInstructions: data.additionalInstructions,
          maxEarn: data.maxEarn ?? financials.maximumEditorEarningMinor,

          // Core Financial Fields (minor units, e.g. paise)
          campaignFund: financials.campaignFundMinor,
          rewardAmount: financials.campaignFundMinor,
          platformFeePercentage: financials.platformFeePercentage,
          platformFee: financials.platformFeeMinor,
          editorRewardPool: financials.editorRewardPoolMinor,
          editorSlots: financials.editorSlots,
          maximumEditorEarning: financials.maximumEditorEarningMinor,
          earningPer1000Views: earningRate,

          creatorId,
        },
      });
    });

    await auditLogService.log(creatorId, "CAMPAIGN_CREATED", "Campaign", campaign.id, null, {
      title: campaign.title,
      campaignFund: campaign.campaignFund,
      editorSlots: campaign.editorSlots,
      maximumEditorEarning: campaign.maximumEditorEarning,
    });

    return campaign;
  },

  async findAll(filters: {
    status?: CampaignStatus;
    socialPlatform?: string;
    creatorId?: string;
    page?: number;
    limit?: number;
  }) {
    const { status, socialPlatform, creatorId, page = 1, limit = 20 } = filters;
    const where = {
      ...(status && { status }),
      ...(socialPlatform && { socialPlatform }),
      ...(creatorId && { creatorId }),
    };

    const [campaigns, total] = await Promise.all([
      prisma.campaign.findMany({
        where,
        include: {
          creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
          _count: { select: { applications: true } },
          applications: {
            where: { status: ApplicationStatus.APPROVED },
            select: { id: true, editorId: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    // Enhance campaigns with filled and remaining slots count
    const enhanced = campaigns.map((camp) => {
      const approvedCount = camp.applications.length;
      const remainingSlots = Math.max(0, camp.editorSlots - approvedCount);
      return {
        ...camp,
        approvedEditorsCount: approvedCount,
        remainingSlots,
      };
    });

    return { campaigns: enhanced, total, page, limit };
  },

  async findById(id: string) {
    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
        _count: { select: { applications: true, submissions: true } },
        applications: {
          where: { status: ApplicationStatus.APPROVED },
          select: { id: true, editorId: true },
        },
      },
    });
    if (!campaign) throw new NotFoundError("Campaign");

    const approvedCount = campaign.applications.length;
    const remainingSlots = Math.max(0, campaign.editorSlots - approvedCount);

    return {
      ...campaign,
      approvedEditorsCount: approvedCount,
      remainingSlots,
    };
  },

  async update(id: string, creatorId: string, data: Partial<{
    title: string;
    description: string;
    thumbnail: string;
    category: string;
    socialPlatform: string;
    deadline: Date;
    contentRequirements: string;
    captionRequirements: string;
    hashtagRequirements: string;
    mentionRequirements: string;
    minimumViews: number;
    minimumEngagement: number;
    additionalInstructions: string;
  }>) {
    const campaign = await this.findById(id);
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (campaign.status === CampaignStatus.COMPLETED || campaign.status === CampaignStatus.CANCELLED) {
      throw new ConflictError("Cannot update a completed or cancelled campaign");
    }
    const updated = await prisma.campaign.update({ where: { id }, data });
    await auditLogService.log(creatorId, "CAMPAIGN_UPDATED", "Campaign", id, campaign, data);
    return updated;
  },

  async transition(id: string, actorId: string, toStatus: CampaignStatus, isAdmin = false) {
    const campaign = await this.findById(id);
    if (!isAdmin && campaign.creatorId !== actorId) throw new ForbiddenError("You do not own this campaign");

    const allowed = ALLOWED_TRANSITIONS[campaign.status];
    if (!allowed.includes(toStatus)) {
      throw new ConflictError(`Cannot transition from ${campaign.status} to ${toStatus}`);
    }

    const updated = await prisma.campaign.update({ where: { id }, data: { status: toStatus } });
    await auditLogService.log(actorId, `CAMPAIGN_${toStatus}`, "Campaign", id, { status: campaign.status }, { status: toStatus });

    // When campaign is cancelled, automatically refund unspent escrow back to the creator's wallet
    if (toStatus === CampaignStatus.CANCELLED && (campaign.campaignFund || campaign.rewardAmount)) {
      try {
        const totalFund = campaign.campaignFund || campaign.rewardAmount;
        const creditedRewards = await prisma.reward.aggregate({
          where: { campaignId: id, status: "CREDITED" },
          _sum: { grossAmount: true },
        });
        const alreadySpent = creditedRewards._sum.grossAmount || 0;
        const refundAmount = Math.max(0, totalFund - alreadySpent);

        if (refundAmount > 0) {
          await walletService.addFunds(
            campaign.creatorId,
            refundAmount,
            `Escrow refund for cancelled campaign "${campaign.title}"`
          );
        }
      } catch (refundErr) {
        console.error("Failed to process escrow refund for cancelled campaign:", refundErr);
      }
    }

    return updated;
  },

  async delete(id: string, creatorId: string) {
    const campaign = await this.findById(id);
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (campaign.status !== CampaignStatus.DRAFT && campaign.status !== CampaignStatus.CANCELLED) {
      throw new ConflictError("Only DRAFT or CANCELLED campaigns can be deleted");
    }

    // Clean up applications or submissions if any
    await prisma.campaignApplication.deleteMany({ where: { campaignId: id } });
    await prisma.campaign.delete({ where: { id } });
    await auditLogService.log(creatorId, "CAMPAIGN_DELETED", "Campaign", id, campaign, null);
  },

  async getCreatorOverview(creatorId: string) {
    const campaigns = await prisma.campaign.findMany({
      where: { creatorId },
      include: {
        _count: {
          select: {
            applications: true,
            submissions: true,
          },
        },
        publishedPosts: {
          select: {
            verifiedViews: true,
          },
        },
        rewards: {
          where: { status: "CREDITED" },
          select: {
            grossAmount: true,
            netAmount: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const wallet = await prisma.wallet.findUnique({
      where: { userId: creatorId },
      include: {
        transactions: true,
      },
    });

    const pendingSubmissions = await prisma.contentSubmission.findMany({
      where: {
        campaign: { creatorId },
        status: SubmissionStatus.SUBMITTED,
      },
      include: {
        editor: {
          select: {
            id: true,
            name: true,
            username: true,
            avatarUrl: true,
          },
        },
        campaign: {
          select: {
            id: true,
            title: true,
            rewardAmount: true,
            editorRewardPool: true,
            earningPer1000Views: true,
            socialPlatform: true,
          },
        },
        publishedPost: {
          select: {
            id: true,
            verifiedViews: true,
            postUrl: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    const activeCampaignsCount = campaigns.filter((c) => c.status === CampaignStatus.PUBLISHED).length;
    const totalApplications = campaigns.reduce((acc, c) => acc + (c._count?.applications ?? 0), 0);
    const totalViewsDelivered = campaigns.reduce((acc, c) => {
      return acc + c.publishedPosts.reduce((pAcc, post) => pAcc + (post.verifiedViews || 0), 0);
    }, 0);

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const creditedRewardsThisMonth = campaigns.reduce((acc, c) => {
      const thisMonth = c.rewards.filter((r) => r.createdAt >= startOfMonth);
      return acc + thisMonth.reduce((rAcc, r) => rAcc + r.grossAmount, 0);
    }, 0);

    const walletDebitsThisMonth = (wallet?.transactions || [])
      .filter((t) => t.amount < 0 && t.createdAt >= startOfMonth)
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const totalSpentThisMonthMinor = creditedRewardsThisMonth > 0 ? creditedRewardsThisMonth : walletDebitsThisMonth;
    const totalSpentThisMonth = Math.round(totalSpentThisMonthMinor / 100);

    const activePoolRemainingMinor = campaigns
      .filter((c) => c.status === CampaignStatus.PUBLISHED)
      .reduce((acc, c) => acc + (c.editorRewardPool || c.campaignFund || c.rewardAmount || 0), 0);

    const walletBalance = wallet ? Math.round(wallet.balance / 100) : 0;
    const totalPoolRemaining = activePoolRemainingMinor > 0 ? Math.round(activePoolRemainingMinor / 100) : 0;

    return {
      stats: {
        activeCampaigns: activeCampaignsCount,
        totalPoolRemaining,
        walletBalance,
        totalViewsDelivered,
        totalSpentThisMonth,
        totalApplications,
        submissionsToReview: pendingSubmissions.length,
      },
      pendingSubmissions,
      recentCampaigns: campaigns.slice(0, 5).map((c) => ({
        id: c.id,
        title: c.title,
        status: c.status,
        category: c.category,
        socialPlatform: c.socialPlatform,
        campaignFund: c.campaignFund,
        rewardAmount: c.rewardAmount,
        editorRewardPool: c.editorRewardPool,
        deadline: c.deadline,
        _count: c._count,
      })),
    };
  },
};
