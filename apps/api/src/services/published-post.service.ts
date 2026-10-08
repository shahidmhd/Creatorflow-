import { PublishedPostStatus, SubmissionStatus } from "@prisma/client";
import { prisma } from "../repositories/prisma";
import { NotFoundError, ForbiddenError, ConflictError } from "../errors";
import { auditLogService } from "./audit-log.service";
import { notificationService } from "./notification.service";
import { rewardService } from "./reward.service";

export const publishedPostService = {
  async submit(editorId: string, submissionId: string, postUrl: string, platform: string) {
    const submission = await prisma.contentSubmission.findUnique({
      where: { id: submissionId },
      include: { campaign: true, publishedPost: true },
    });
    if (!submission) throw new NotFoundError("Submission");
    if (submission.editorId !== editorId) throw new ForbiddenError("You do not own this submission");
    if (submission.status !== SubmissionStatus.APPROVED) {
      throw new ConflictError("Submission must be approved before submitting the published post URL");
    }
    if (submission.publishedPost) {
      throw new ConflictError("A published post has already been submitted for this submission");
    }

    const post = await prisma.publishedPost.create({
      data: {
        submissionId,
        campaignId: submission.campaignId,
        editorId,
        postUrl,
        platform,
      },
    });

    await notificationService.create(
      submission.campaign.creatorId,
      "POST_SUBMITTED",
      "Published Post Submitted",
      `An editor has submitted a published post URL for "${submission.campaign.title}"`
    );
    await auditLogService.log(editorId, "POST_SUBMITTED", "PublishedPost", post.id, null, { postUrl, platform });
    return post;
  },

  async findById(id: string) {
    const post = await prisma.publishedPost.findUnique({
      where: { id },
      include: {
        submission: true,
        campaign: true,
        editor: { select: { id: true, name: true, username: true } },
      },
    });
    if (!post) throw new NotFoundError("Published post");
    return post;
  },

  async findByCampaign(campaignId: string, creatorId: string) {
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new NotFoundError("Campaign");
    if (campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");

    return prisma.publishedPost.findMany({
      where: { campaignId },
      include: {
        editor: { select: { id: true, name: true, username: true } },
        submission: true,
        reward: true,
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async findByEditor(editorId: string) {
    return prisma.publishedPost.findMany({
      where: { editorId },
      include: { campaign: { select: { id: true, title: true } }, reward: true },
      orderBy: { createdAt: "desc" },
    });
  },

  async verify(id: string, creatorId: string, verificationNotes?: string, verifiedViews = 0) {
    const post = await this.findById(id);
    if (post.campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (post.status !== PublishedPostStatus.PENDING_VERIFICATION) {
      throw new ConflictError("Post has already been reviewed");
    }

    const views = Math.max(0, Number(verifiedViews) || 0);

    const updated = await prisma.publishedPost.update({
      where: { id },
      data: {
        status: PublishedPostStatus.VERIFIED,
        verifiedAt: new Date(),
        verificationNotes,
        verifiedViews: views,
      },
    });

    // Auto-create a pending reward computed from views and slot cap
    await rewardService.createPending(id, post.campaign.id, post.editorId, views, { isViews: true });

    await notificationService.create(
      post.editorId,
      "POST_VERIFIED",
      "Post Verified",
      `Your published post for "${post.campaign.title}" was verified with ${views.toLocaleString()} views. Reward is pending creator approval.`
    );
    await auditLogService.log(
      creatorId,
      "POST_VERIFIED",
      "PublishedPost",
      id,
      { status: "PENDING_VERIFICATION" },
      { status: "VERIFIED", verifiedViews: views }
    );
    return updated;
  },

  async reject(id: string, creatorId: string, verificationNotes: string) {
    const post = await this.findById(id);
    if (post.campaign.creatorId !== creatorId) throw new ForbiddenError("You do not own this campaign");
    if (post.status !== PublishedPostStatus.PENDING_VERIFICATION) {
      throw new ConflictError("Post has already been reviewed");
    }

    const updated = await prisma.publishedPost.update({
      where: { id },
      data: { status: PublishedPostStatus.REJECTED, verificationNotes },
    });

    await notificationService.create(
      post.editorId,
      "POST_REJECTED",
      "Post Rejected",
      `Your published post for "${post.campaign.title}" was rejected. Reason: ${verificationNotes}`
    );
    await auditLogService.log(creatorId, "POST_REJECTED", "PublishedPost", id, { status: "PENDING_VERIFICATION" }, { status: "REJECTED" });
    return updated;
  },
};
