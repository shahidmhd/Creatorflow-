import { CampaignStatus, ApplicationStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";
import { earningsCalculationService } from "./earnings-calculation.service";

const ALLOWED_TRANSITIONS: Record<CampaignStatus, CampaignStatus[]> = {
  DRAFT: [CampaignStatus.PUBLISHED, CampaignStatus.CANCELLED],
  PUBLISHED: [CampaignStatus.PAUSED, CampaignStatus.COMPLETED, CampaignStatus.CANCELLED],
  PAUSED: [CampaignStatus.PUBLISHED, CampaignStatus.CANCELLED],
  COMPLETED: [],
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

    const campaign = await prisma.campaign.create({
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
    return updated;
  },

  async delete(id: string, creatorId: string) {
    const campaign = await this.findById(id);
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (campaign.status !== CampaignStatus.DRAFT) throw new ConflictError("Only DRAFT campaigns can be deleted");
    await prisma.campaign.delete({ where: { id } });
  },
};
