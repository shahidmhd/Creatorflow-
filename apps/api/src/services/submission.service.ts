import { SubmissionStatus, ApplicationStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";

const ALLOWED_TRANSITIONS: Record<SubmissionStatus, SubmissionStatus[]> = {
  DRAFT: [SubmissionStatus.SUBMITTED],
  SUBMITTED: [SubmissionStatus.APPROVED, SubmissionStatus.CHANGES_REQUESTED, SubmissionStatus.REJECTED],
  CHANGES_REQUESTED: [SubmissionStatus.SUBMITTED],
  APPROVED: [],
  REJECTED: [],
};

export const submissionService = {
  async create(editorId: string, campaignId: string, data: { contentUrl: string; caption?: string; notes?: string }) {
    // Must have an approved application
    const application = await prisma.campaignApplication.findUnique({
      where: { campaignId_editorId: { campaignId, editorId } },
    });
    if (!application || application.status !== ApplicationStatus.APPROVED) {
      throw new ForbiddenError("You must have an approved application to submit content");
    }

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");

    // Check if active submission already exists for this campaign and editor
    const existingSubmission = await prisma.contentSubmission.findFirst({
      where: { campaignId, editorId },
    });

    if (existingSubmission) {
      if (existingSubmission.status === SubmissionStatus.CHANGES_REQUESTED || existingSubmission.status === SubmissionStatus.DRAFT) {
        // Legitimate revision update
        const updated = await prisma.contentSubmission.update({
          where: { id: existingSubmission.id },
          data: {
            ...data,
            status: SubmissionStatus.SUBMITTED,
            submittedAt: new Date(),
          },
        });
        await auditLogService.log(editorId, "SUBMISSION_RESUBMITTED", "ContentSubmission", updated.id, null, { campaignId });
        return updated;
      }
      throw new ConflictError("An active submission already exists for this campaign", "SUBMISSION_ALREADY_EXISTS");
    }

    const submission = await prisma.contentSubmission.create({
      data: { ...data, campaignId, editorId, status: SubmissionStatus.SUBMITTED, submittedAt: new Date() },
    });
    await auditLogService.log(editorId, "SUBMISSION_CREATED", "ContentSubmission", submission.id, null, { campaignId });
    return submission;
  },

  async findById(id: string) {
    const submission = await prisma.contentSubmission.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, title: true, creatorId: true, rewardAmount: true } },
        editor: { select: { id: true, name: true, username: true } },
        publishedPost: true,
      },
    });
    if (!submission) throw new NotFoundError("Submission");
    return submission;
  },

  async findByCampaign(campaignId: string, creatorId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");

    return prisma.contentSubmission.findMany({
      where: { campaignId },
      include: { editor: { select: { id: true, name: true, username: true, avatarUrl: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByEditor(editorId: string) {
    return prisma.contentSubmission.findMany({
      where: { editorId },
      include: { campaign: { select: { id: true, title: true, rewardAmount: true, currency: true } } },
      orderBy: { createdAt: "desc" },
    });
  },

  async transition(id: string, actorId: string, toStatus: SubmissionStatus, actorRole: "CREATOR" | "EDITOR", feedback?: string) {
    const submission = await this.findById(id);
    const allowed = ALLOWED_TRANSITIONS[submission.status];
    if (!allowed.includes(toStatus)) {
      throw new ConflictError(`Cannot transition from ${submission.status} to ${toStatus}`);
    }

    const isEditorAction = toStatus === SubmissionStatus.SUBMITTED;
    if (isEditorAction) {
      if (submission.editorId !== actorId) throw new ForbiddenError("You do not own this submission");
    } else {
      if (submission.campaign.creatorId !== actorId) throw new ForbiddenError("You do not own this campaign");
    }

    const data: Record<string, unknown> = {
      status: toStatus,
      ...(toStatus === SubmissionStatus.SUBMITTED && { submittedAt: new Date() }),
      ...(toStatus !== SubmissionStatus.SUBMITTED && { reviewedAt: new Date() }),
      ...(feedback && { feedback }),
    };

    const updated = await prisma.contentSubmission.update({ where: { id }, data });

    // Notify
    const recipientId = isEditorAction ? submission.campaign.creatorId : submission.editorId;
    await notificationService.create(
      recipientId,
      `SUBMISSION_${toStatus}`,
      `Submission ${toStatus.replace("_", " ").toLowerCase()}`,
      `A content submission for "${submission.campaign.title}" is ${toStatus.toLowerCase().replace("_", " ")}`
    );
    await auditLogService.log(actorId, `SUBMISSION_${toStatus}`, "ContentSubmission", id, { status: submission.status }, { status: toStatus });
    return updated;
  },
};
