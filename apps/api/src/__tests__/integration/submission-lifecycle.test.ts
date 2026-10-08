import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../repositories/prisma";
import { CampaignStatus, ApplicationStatus, SubmissionStatus, PublishedPostStatus, RewardStatus } from "@prisma/client";
import { rewardService } from "../../services/reward.service";

describe("Submission Lifecycle & Reward Integrity Integration Tests", () => {
  let creatorId: string;
  let editorId: string;
  let otherEditorId: string;
  let creatorToken: string;
  let editorToken: string;
  let otherEditorToken: string;

  beforeAll(async () => {
    // Clean up
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { user: { email: { in: ["test_sub_creator@test.com", "test_sub_editor@test.com", "test_sub_other@test.com"] } } } },
    });
    await prisma.wallet.deleteMany({
      where: { user: { email: { in: ["test_sub_creator@test.com", "test_sub_editor@test.com", "test_sub_other@test.com"] } } },
    });
    await prisma.reward.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.publishedPost.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.contentSubmission.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[SUB_TEST]" } } });
    await prisma.user.deleteMany({
      where: { email: { in: ["test_sub_creator@test.com", "test_sub_editor@test.com", "test_sub_other@test.com"] } },
    });

    // Create Creator
    const creator = await prisma.user.create({
      data: {
        supabaseId: "test-sub-creator-id",
        email: "test_sub_creator@test.com",
        name: "Sub Test Creator",
        username: "testcreator_sub",
        role: "CREATOR",
      },
    });
    creatorId = creator.id;
    creatorToken = `creatorflow_token_${creator.id}`;

    // Create Editor
    const editor = await prisma.user.create({
      data: {
        supabaseId: "test-sub-editor-id",
        email: "test_sub_editor@test.com",
        name: "Sub Test Editor",
        username: "testeditor_sub",
        role: "EDITOR",
        wallet: { create: { balance: 0, currency: "INR" } },
      },
    });
    editorId = editor.id;
    editorToken = `creatorflow_token_${editor.id}`;

    // Create Other Editor (not approved)
    const other = await prisma.user.create({
      data: {
        supabaseId: "test-sub-other-id",
        email: "test_sub_other@test.com",
        name: "Other Editor",
        username: "testother_sub",
        role: "EDITOR",
        wallet: { create: { balance: 0, currency: "INR" } },
      },
    });
    otherEditorId = other.id;
    otherEditorToken = `creatorflow_token_${other.id}`;
  });

  afterAll(async () => {
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { user: { id: { in: [creatorId, editorId, otherEditorId] } } } },
    });
    await prisma.wallet.deleteMany({
      where: { user: { id: { in: [creatorId, editorId, otherEditorId] } } },
    });
    await prisma.reward.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.publishedPost.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.contentSubmission.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[SUB_TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[SUB_TEST]" } } });
    await prisma.user.deleteMany({ where: { id: { in: [creatorId, editorId, otherEditorId] } } });
    await prisma.$disconnect();
  });

  it("prevents submitting content without an approved application", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[SUB_TEST] Unapproved Editor Test",
        description: "Test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 100000,
        deadline: new Date(Date.now() + 86400000),
        status: CampaignStatus.PUBLISHED,
      },
    });

    const res = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${otherEditorToken}`)
      .send({
        campaignId: campaign.id,
        contentUrl: "https://example.com/video.mp4",
        caption: "Test caption",
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("must have an approved application");
  });

  it("allows submission, prevents duplicate submissions, handles revisions cleanly", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[SUB_TEST] Full Lifecycle Campaign",
        description: "Full lifecycle test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 100000, // ₹1,000 in paise
        deadline: new Date(Date.now() + 86400000),
        status: CampaignStatus.PUBLISHED,
      },
    });

    // Create approved application for editor
    await prisma.campaignApplication.create({
      data: {
        campaignId: campaign.id,
        editorId,
        status: ApplicationStatus.APPROVED,
      },
    });

    // 1. Initial submission
    const subRes1 = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        campaignId: campaign.id,
        contentUrl: "https://example.com/draft-v1.mp4",
        caption: "Draft v1",
      });

    expect(subRes1.status).toBe(201);
    expect(subRes1.body.data.status).toBe("SUBMITTED");
    const subId = subRes1.body.data.id;

    // 2. Attempt duplicate submission while SUBMITTED -> Should fail with 409
    const subResDuplicate = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        campaignId: campaign.id,
        contentUrl: "https://example.com/draft-duplicate.mp4",
        caption: "Duplicate",
      });

    expect(subResDuplicate.status).toBe(409);
    expect(subResDuplicate.body.error).toContain("An active submission already exists");

    // 3. Creator requests changes
    const reqChangesRes = await request(app)
      .post(`/api/v1/submissions/${subId}/request-changes`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({ feedback: "Needs higher volume and faster cuts" });

    expect(reqChangesRes.status).toBe(200);
    expect(reqChangesRes.body.data.status).toBe("CHANGES_REQUESTED");
    expect(reqChangesRes.body.data.feedback).toBe("Needs higher volume and faster cuts");

    // 4. Editor resubmits revised content -> Should update the SAME submission, not create duplicate row
    const resubmitRes = await request(app)
      .post("/api/v1/submissions")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        campaignId: campaign.id,
        contentUrl: "https://example.com/draft-v2-revised.mp4",
        caption: "Draft v2 with faster cuts",
      });

    expect(resubmitRes.status).toBe(201);
    expect(resubmitRes.body.data.id).toBe(subId); // SAME ID!
    expect(resubmitRes.body.data.status).toBe("SUBMITTED");
    expect(resubmitRes.body.data.contentUrl).toBe("https://example.com/draft-v2-revised.mp4");

    // Verify DB count is still 1
    const totalSubs = await prisma.contentSubmission.count({
      where: { campaignId: campaign.id, editorId },
    });
    expect(totalSubs).toBe(1);

    // 5. Creator approves content
    const approveSubRes = await request(app)
      .post(`/api/v1/submissions/${subId}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(approveSubRes.status).toBe(200);
    expect(approveSubRes.body.data.status).toBe("APPROVED");

    // 6. Editor submits published post URL
    const postRes = await request(app)
      .post("/api/v1/published-posts")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        submissionId: subId,
        postUrl: "https://instagram.com/reel/123456789",
        platform: "Instagram",
      });

    expect(postRes.status).toBe(201);
    expect(postRes.body.data.status).toBe("PENDING_VERIFICATION");
    const postId = postRes.body.data.id;

    // 7. Duplicate published post fails
    const postResDup = await request(app)
      .post("/api/v1/published-posts")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        submissionId: subId,
        postUrl: "https://instagram.com/reel/999999999",
        platform: "Instagram",
      });

    expect(postResDup.status).toBe(409);
    expect(postResDup.body.error).toContain("already been submitted");

    // 8. Creator verifies post -> triggers pending reward creation
    const verifyRes = await request(app)
      .post(`/api/v1/published-posts/${postId}/verify`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({ verificationNotes: "All hashtags verified" });

    expect(verifyRes.status).toBe(200);
    expect(verifyRes.body.data.status).toBe("VERIFIED");

    // Check reward in DB
    const reward = await prisma.reward.findUnique({
      where: { publishedPostId: postId },
    });
    expect(reward).toBeDefined();
    expect(reward!.grossAmount).toBe(100000); // ₹1,000 in paise
    expect(reward!.platformFee).toBe(15000);  // 15% = ₹150 in paise
    expect(reward!.netAmount).toBe(85000);    // 85% = ₹850 in paise
    expect(reward!.status).toBe(RewardStatus.PENDING);

    // 9. Creator approves reward
    const approveRewardRes = await request(app)
      .post(`/api/v1/rewards/${reward!.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(approveRewardRes.status).toBe(200);
    expect(approveRewardRes.body.data.status).toBe("CREDITED");

    // Verify Editor's wallet was credited exactly 85000 paise (₹850)
    const wallet = await prisma.wallet.findUnique({
      where: { userId: editorId },
    });
    expect(wallet!.balance).toBe(85000);

    // Verify wallet transaction ledger
    const txs = await prisma.walletTransaction.findMany({
      where: { walletId: wallet!.id },
    });
    expect(txs.length).toBe(2);
    const rewardTx = txs.find((t) => t.type === "REWARD");
    const feeTx = txs.find((t) => t.type === "PLATFORM_FEE");
    expect(rewardTx).toBeDefined();
    expect(rewardTx!.amount).toBe(85000);
    expect(feeTx).toBeDefined();
    expect(feeTx!.amount).toBe(15000);

    // 10. Attempting to approve reward again fails with 409
    const secondApprove = await request(app)
      .post(`/api/v1/rewards/${reward!.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(secondApprove.status).toBe(409);
    expect(secondApprove.body.error).toContain("Reward is already CREDITED");

    // Wallet balance remains strictly 85000
    const finalWallet = await prisma.wallet.findUnique({
      where: { userId: editorId },
    });
    expect(finalWallet!.balance).toBe(85000);
  });

  it("handles concurrent reward approval race condition atomically", async () => {
    // Create new campaign, submission, post, and pending reward
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[SUB_TEST] Concurrent Reward Campaign",
        description: "Test reward concurrency",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 200000, // ₹2,000 = 200000 paise (85% = 170000 paise)
        deadline: new Date(Date.now() + 86400000),
        status: CampaignStatus.PUBLISHED,
      },
    });

    const sub = await prisma.contentSubmission.create({
      data: {
        campaignId: campaign.id,
        editorId,
        contentUrl: "https://example.com/v.mp4",
        status: SubmissionStatus.APPROVED,
      },
    });

    const post = await prisma.publishedPost.create({
      data: {
        submissionId: sub.id,
        campaignId: campaign.id,
        editorId,
        postUrl: "https://instagram.com/p/concurrent1",
        platform: "Instagram",
        status: PublishedPostStatus.VERIFIED,
      },
    });

    const reward = await rewardService.createPending(post.id, campaign.id, editorId, 200000);

    const initialWallet = await prisma.wallet.findUnique({ where: { userId: editorId } });
    const initialBalance = initialWallet!.balance;

    // Fire 2 simultaneous reward approve calls
    const results = await Promise.allSettled([
      rewardService.approve(reward.id, creatorId),
      rewardService.approve(reward.id, creatorId),
    ]);

    const fulfilled = results.filter((r) => r.status === "fulfilled");
    const rejected = results.filter((r) => r.status === "rejected");

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    // Verify wallet was only credited once: initialBalance + 170000
    const finalWallet = await prisma.wallet.findUnique({ where: { userId: editorId } });
    expect(finalWallet!.balance).toBe(initialBalance + 170000);
  });
});
