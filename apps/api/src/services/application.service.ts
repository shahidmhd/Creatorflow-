import { ApplicationStatus, CampaignStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";

const ALLOWED_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  PENDING: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED, ApplicationStatus.WITHDRAWN],
  APPROVED: [],
  REJECTED: [],
  WITHDRAWN: [],
};

export const applicationService = {
  async apply(editorId: string, campaignId: string, message?: string) {
    // Verify campaign exists and is published
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.status !== CampaignStatus.PUBLISHED) {
      throw new ConflictError("Campaign is not open for applications");
    }
    if (campaign.deadline < new Date()) throw new ConflictError("Campaign deadline has passed");

    // Check for duplicate application
    const existing = await prisma.campaignApplication.findUnique({
      where: { campaignId_editorId: { campaignId, editorId } },
    });
    if (existing) {
      throw new ConflictError("You have already applied to this campaign.", "APPLICATION_ALREADY_EXISTS");
    }

    const application = await prisma.campaignApplication.create({
      data: { campaignId, editorId, message },
      include: { campaign: { select: { title: true, creatorId: true } }, editor: { select: { name: true } } },
    });

    await notificationService.create(
      application.campaign.creatorId,
      "NEW_APPLICATION",
      "New Application",
      `${application.editor.name} applied to your campaign "${application.campaign.title}"`
    );
    await auditLogService.log(editorId, "APPLICATION_CREATED", "CampaignApplication", application.id, null, { campaignId });
    return application;
  },

  async findByCampaign(campaignId: string, creatorId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");

    return prisma.campaignApplication.findMany({
      where: { campaignId },
      include: { editor: { select: { id: true, name: true, username: true, avatarUrl: true, editorProfile: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByEditor(editorId: string) {
    return prisma.campaignApplication.findMany({
      where: { editorId },
      include: { campaign: { select: { id: true, title: true, status: true, rewardAmount: true, currency: true, deadline: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id: string) {
    const app = await prisma.campaignApplication.findUnique({
      where: { id },
      include: {
        campaign: true,
        editor: { select: { id: true, name: true, username: true } },
      },
    });
    if (!app) throw new NotFoundError("Application");
    return app;
  },

  async transition(id: string, actorId: string, toStatus: ApplicationStatus, actorRole: "CREATOR" | "EDITOR") {
    const application = await this.findById(id);
    const allowed = ALLOWED_TRANSITIONS[application.status];
    if (!allowed.includes(toStatus)) {
      throw new ConflictError(`Cannot transition from ${application.status} to ${toStatus}`);
    }

    // Only creator can approve/reject; only editor can withdraw
    if ((toStatus === ApplicationStatus.APPROVED || toStatus === ApplicationStatus.REJECTED) && actorRole !== "CREATOR") {
      throw new ForbiddenError("Only the creator can approve or reject applications");
    }
    if (toStatus === ApplicationStatus.WITHDRAWN) {
      if (application.editorId !== actorId) throw new ForbiddenError("You can only withdraw your own application");
    } else {
      if (application.campaign.creatorId !== actorId) throw new ForbiddenError("You do not own this campaign");
    }

    // Atomically transition status, enforcing editor slots limit on approval
    const updated = await prisma.$transaction(async (tx) => {
      if (toStatus === ApplicationStatus.APPROVED) {
        // Lock campaign row to serialize concurrent approvals
        await tx.$queryRaw`SELECT id, "editorSlots" FROM "Campaign" WHERE id = ${application.campaignId}::uuid FOR UPDATE`;

        const approvedCount = await tx.campaignApplication.count({
          where: { campaignId: application.campaignId, status: ApplicationStatus.APPROVED },
        });

        if (approvedCount >= application.campaign.editorSlots) {
          throw new ConflictError(
            `Cannot approve application. All ${application.campaign.editorSlots} editor slots have been filled.`
          );
        }
      }

      return tx.campaignApplication.update({
        where: { id },
        data: { status: toStatus },
      });
    });

    // Notify editor
    await notificationService.create(
      application.editorId,
      `APPLICATION_${toStatus}`,
      `Application ${toStatus.toLowerCase()}`,
      `Your application to "${application.campaign.title}" was ${toStatus.toLowerCase()}`
    );
    await auditLogService.log(actorId, `APPLICATION_${toStatus}`, "CampaignApplication", id, { status: application.status }, { status: toStatus });
    return updated;
  },
};
