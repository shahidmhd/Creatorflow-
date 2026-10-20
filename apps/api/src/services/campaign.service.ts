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
          rewards: {
            where: { status: "CREDITED" },
            select: { grossAmount: true, netAmount: true },
          },
        },
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.campaign.count({ where }),
    ]);

    // Enhance campaigns with filled and remaining slots count and remaining pool
    const enhanced = campaigns.map((camp) => {
      const approvedCount = camp.applications.length;
      const remainingSlots = Math.max(0, camp.editorSlots - approvedCount);
      const creditedNet = camp.rewards?.reduce((sum, r) => sum + r.netAmount, 0) || 0;
      const creditedGross = camp.rewards?.reduce((sum, r) => sum + r.grossAmount, 0) || 0;

      const initialFund = camp.campaignFund || camp.rewardAmount;
      const initialPool = camp.editorRewardPool || Math.floor(initialFund * 0.85);

      const editorRewardPoolRemaining = Math.max(0, initialPool - creditedNet);
      const campaignFundRemaining = Math.max(0, initialFund - creditedGross);

      return {
        ...camp,
        approvedEditorsCount: approvedCount,
        remainingSlots,
        editorRewardPoolRemaining,
        campaignFundRemaining,
        totalPaidNet: creditedNet,
        totalDisbursedGross: creditedGross,
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
        rewards: {
          where: { status: "CREDITED" },
          select: { grossAmount: true, netAmount: true, platformFee: true, verifiedViews: true },
        },
      },
    });
    if (!campaign) throw new NotFoundError("Campaign");

    const approvedCount = campaign.applications.length;
    const remainingSlots = Math.max(0, campaign.editorSlots - approvedCount);

    const totalPaidNet = campaign.rewards.reduce((sum, r) => sum + r.netAmount, 0);
    const totalDisbursedGross = campaign.rewards.reduce((sum, r) => sum + r.grossAmount, 0);

    const initialFund = campaign.campaignFund || campaign.rewardAmount;
    const initialPool = campaign.editorRewardPool || Math.floor(initialFund * 0.85);

    const editorRewardPoolRemaining = Math.max(0, initialPool - totalPaidNet);
    const campaignFundRemaining = Math.max(0, initialFund - totalDisbursedGross);

    return {
      ...campaign,
      approvedEditorsCount: approvedCount,
      remainingSlots,
      editorRewardPoolRemaining,
      campaignFundRemaining,
      totalPaidNet,
      totalDisbursedGross,
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
      .reduce((acc, c) => {
        const pool = c.editorRewardPool || Math.floor((c.campaignFund || c.rewardAmount || 0) * 0.85);
        const creditedNet = c.rewards.reduce((rAcc, r) => rAcc + r.netAmount, 0);
        return acc + Math.max(0, pool - creditedNet);
      }, 0);

    const activeEscrowRemainingMinor = campaigns
      .filter((c) => c.status === CampaignStatus.PUBLISHED)
      .reduce((acc, c) => {
        const totalFund = c.campaignFund || c.rewardAmount || 0;
        const creditedGross = c.rewards.reduce((rAcc, r) => rAcc + r.grossAmount, 0);
        return acc + Math.max(0, totalFund - creditedGross);
      }, 0);

    const totalDisbursedMinor = campaigns.reduce((acc, c) => {
      return acc + c.rewards.reduce((rAcc, r) => rAcc + r.grossAmount, 0);
    }, 0);

    const walletBalance = wallet ? Math.round(wallet.balance / 100) : 0;
    const totalPoolRemaining = Math.round(activePoolRemainingMinor / 100);

    return {
      stats: {
        activeCampaigns: activeCampaignsCount,
        totalPoolRemaining,
        activeEscrowRemaining: Math.round(activeEscrowRemainingMinor / 100),
        totalDisbursed: Math.round(totalDisbursedMinor / 100),
        walletBalance,
        totalViewsDelivered,
        totalSpentThisMonth,
        totalApplications,
        submissionsToReview: pendingSubmissions.length,
      },
      pendingSubmissions,
      recentCampaigns: campaigns.slice(0, 5).map((c) => {
        const initialFund = c.campaignFund || c.rewardAmount;
        const initialPool = c.editorRewardPool || Math.floor(initialFund * 0.85);
        const creditedNet = c.rewards.reduce((rAcc, r) => rAcc + r.netAmount, 0);
        const creditedGross = c.rewards.reduce((rAcc, r) => rAcc + r.grossAmount, 0);

        return {
          id: c.id,
          title: c.title,
          status: c.status,
          category: c.category,
          socialPlatform: c.socialPlatform,
          campaignFund: initialFund,
          campaignFundRemaining: Math.max(0, initialFund - creditedGross),
          rewardAmount: c.rewardAmount,
          editorRewardPool: initialPool,
          editorRewardPoolRemaining: Math.max(0, initialPool - creditedNet),
          totalPaidNet: creditedNet,
          totalDisbursedGross: creditedGross,
          deadline: c.deadline,
          _count: c._count,
        };
      }),
    };
  },

  async getEditorOverview(editorId: string) {
    const [wallet, rewards, submissions, publishedPosts, featuredCampaign] = await Promise.all([
      prisma.wallet.findUnique({
        where: { userId: editorId },
        include: { transactions: { orderBy: { createdAt: "desc" }, take: 10 } },
      }),
      prisma.reward.findMany({
        where: { editorId },
        include: {
          campaign: { select: { id: true, title: true, socialPlatform: true } },
          publishedPost: { select: { id: true, postUrl: true, verifiedViews: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.contentSubmission.findMany({
        where: { editorId },
        include: {
          campaign: {
            select: {
              id: true,
              title: true,
              socialPlatform: true,
              category: true,
              rewardAmount: true,
              campaignFund: true,
              editorRewardPool: true,
              maximumEditorEarning: true,
              earningPer1000Views: true,
              creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
            },
          },
          publishedPost: {
            include: { reward: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.publishedPost.findMany({
        where: { submission: { editorId } },
        select: { verifiedViews: true, status: true },
      }),
      prisma.campaign.findFirst({
        where: { status: CampaignStatus.PUBLISHED },
        orderBy: { campaignFund: "desc" },
        include: {
          creator: { select: { id: true, name: true, username: true, avatarUrl: true } },
          applications: { where: { status: ApplicationStatus.APPROVED } },
        },
      }),
    ]);

    const walletBalance = wallet ? Math.round(wallet.balance / 100) : 0;

    // Earned = credited rewards netAmount
    const creditedRewards = rewards.filter((r) => r.status === "CREDITED");
    const totalEarnedMinor = creditedRewards.reduce((sum, r) => sum + r.netAmount, 0);
    const totalEarned = Math.round(totalEarnedMinor / 100);

    // Pending = pending rewards netAmount
    const pendingRewards = rewards.filter((r) => r.status === "PENDING");
    const pendingPayoutsMinor = pendingRewards.reduce((sum, r) => sum + r.netAmount, 0);
    const pendingPayouts = Math.round(pendingPayoutsMinor / 100);

    // Verified views across all verified published posts
    const totalVerifiedViews = publishedPosts
      .filter((p) => p.status === "VERIFIED")
      .reduce((sum, p) => sum + (p.verifiedViews || 0), 0);

    // Submissions counts
    const activeSubmissionsCount = submissions.filter(
      (s) => s.status === SubmissionStatus.SUBMITTED || s.status === SubmissionStatus.CHANGES_REQUESTED
    ).length;

    const approvedSubmissionsCount = submissions.filter(
      (s) => s.status === SubmissionStatus.APPROVED
    ).length;

    const rejectedSubmissionsCount = submissions.filter(
      (s) => s.status === SubmissionStatus.REJECTED
    ).length;

    const totalDecided = approvedSubmissionsCount + rejectedSubmissionsCount;
    const approvalRate = totalDecided > 0
      ? Math.round((approvedSubmissionsCount / totalDecided) * 100)
      : (approvedSubmissionsCount > 0 ? 100 : 0);

    // Dynamic recent activities from real submissions and credited rewards
    const recentActivities: Array<{
      id: string;
      message: string;
      campaignTitle?: string;
      status: string;
      amount?: number;
      time: string;
      contentUrl?: string;
    }> = [];

    // Add credited rewards
    for (const r of creditedRewards) {
      recentActivities.push({
        id: `reward-${r.id}`,
        message: `Reward credited: ₹${Math.round(r.netAmount / 100).toLocaleString("en-IN")} for "${r.campaign.title}"`,
        campaignTitle: r.campaign.title,
        status: "APPROVED",
        amount: Math.round(r.netAmount / 100),
        time: r.creditedAt ? new Date(r.creditedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recently",
        contentUrl: r.publishedPost?.postUrl,
      });
    }

    // Add recent submissions
    for (const s of submissions) {
      let msg = `Submission for "${s.campaign.title}"`;
      if (s.status === "APPROVED") {
        const netPaise = s.publishedPost?.reward?.netAmount;
        msg = netPaise
          ? `Clip approved for "${s.campaign.title}" — ₹${Math.round(netPaise / 100).toLocaleString("en-IN")} earned`
          : `Clip approved for "${s.campaign.title}"`;
      } else if (s.status === "CHANGES_REQUESTED") {
        msg = `Changes requested on "${s.campaign.title}": ${s.feedback || "Revisions needed"}`;
      } else if (s.status === "SUBMITTED") {
        msg = `Clip submitted for "${s.campaign.title}" — in brand review`;
      }
      recentActivities.push({
        id: `sub-${s.id}`,
        message: msg,
        campaignTitle: s.campaign.title,
        status: s.status,
        amount: s.publishedPost?.reward ? Math.round(s.publishedPost.reward.netAmount / 100) : undefined,
        time: s.submittedAt ? new Date(s.submittedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Recently",
        contentUrl: s.contentUrl,
      });
    }

    // Featured campaign formatting if available
    let featured = null;
    if (featuredCampaign) {
      const fund = featuredCampaign.campaignFund || featuredCampaign.rewardAmount;
      const pool = featuredCampaign.editorRewardPool || Math.floor(fund * 0.85);
      const approvedCount = featuredCampaign.applications.length;
      const remainingSlots = Math.max(0, featuredCampaign.editorSlots - approvedCount);
      const maxEditorEarning = featuredCampaign.maximumEditorEarning || Math.floor(pool / (featuredCampaign.editorSlots || 1));

      featured = {
        id: featuredCampaign.id,
        title: featuredCampaign.title,
        description: featuredCampaign.description,
        category: featuredCampaign.category,
        socialPlatform: featuredCampaign.socialPlatform,
        thumbnail: featuredCampaign.thumbnail,
        campaignFund: fund,
        editorRewardPool: pool,
        editorSlots: featuredCampaign.editorSlots,
        remainingSlots,
        maximumEditorEarning: Math.round(maxEditorEarning / 100),
        earningPer1000Views: Math.round(featuredCampaign.earningPer1000Views / 100),
        creator: featuredCampaign.creator,
      };
    }

    return {
      stats: {
        walletBalance,
        totalEarned,
        pendingPayouts,
        totalVerifiedViews,
        activeSubmissions: activeSubmissionsCount,
        approvedSubmissions: approvedSubmissionsCount,
        totalSubmissions: submissions.length,
        approvalRate,
      },
      recentActivities: recentActivities.slice(0, 6),
      featuredCampaign: featured,
      recentSubmissions: submissions.slice(0, 5),
    };
  },
};
