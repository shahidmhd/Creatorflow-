import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../repositories/prisma";
import { CampaignStatus, ApplicationStatus, SubmissionStatus, PublishedPostStatus, RewardStatus } from "@prisma/client";

describe("Campaign Slot Concurrency & View-Based Reward Integration Tests", () => {
  let creatorId: string;
  let creatorToken: string;
  const editorIds: string[] = [];
  const editorTokens: string[] = [];

  beforeAll(async () => {
    // Clean up test data
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { user: { email: { startsWith: "test_slot_" } } } },
    });
    await prisma.wallet.deleteMany({
      where: { user: { email: { startsWith: "test_slot_" } } },
    });
    await prisma.reward.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.publishedPost.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.contentSubmission.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.campaignApplication.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.campaign.deleteMany({
      where: { title: { startsWith: "[SLOT_TEST]" } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_slot_" } },
    });

    // Create test Creator
    const creator = await prisma.user.create({
      data: {
        supabaseId: "test-slot-creator-sub",
        email: "test_slot_creator@test.com",
        name: "Slot Test Creator",
        username: "testcreator_slot",
        role: "CREATOR",
      },
    });
    creatorId = creator.id;
    creatorToken = `creatorflow_token_${creator.id}`;

    // Create 11 test Editors
    for (let i = 1; i <= 11; i++) {
      const editor = await prisma.user.create({
        data: {
          supabaseId: `test-slot-editor-sub-${i}`,
          email: `test_slot_editor_${i}@test.com`,
          name: `Slot Test Editor ${i}`,
          username: `testeditor_slot_${i}`,
          role: "EDITOR",
          wallet: {
            create: { balance: 0, currency: "INR" },
          },
        },
      });
      editorIds.push(editor.id);
      editorTokens.push(`creatorflow_token_${editor.id}`);
    }
  });

  afterAll(async () => {
    await prisma.walletTransaction.deleteMany({
      where: { wallet: { user: { email: { startsWith: "test_slot_" } } } },
    });
    await prisma.wallet.deleteMany({
      where: { user: { email: { startsWith: "test_slot_" } } },
    });
    await prisma.reward.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.publishedPost.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.contentSubmission.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.campaignApplication.deleteMany({
      where: { campaign: { title: { startsWith: "[SLOT_TEST]" } } },
    });
    await prisma.campaign.deleteMany({
      where: { title: { startsWith: "[SLOT_TEST]" } },
    });
    await prisma.user.deleteMany({
      where: { email: { startsWith: "test_slot_" } },
    });
    await prisma.$disconnect();
  });

  it("strictly enforces editorSlots cap under high concurrency (9 filled -> 2 concurrent approvals -> 1 succeeds, 1 gets 409)", async () => {
    // 1. Create Campaign with 10 slots
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[SLOT_TEST] 10 Slots Race Campaign",
        description: "Testing slot race conditions",
        category: "Tech",
        socialPlatform: "YouTube",
        rewardAmount: 8500, // per editor max
        campaignFund: 100000, // ₹1,000
        platformFeePercentage: 15,
        platformFee: 15000,
        editorRewardPool: 85000,
        editorSlots: 10,
        maximumEditorEarning: 8500,
        earningPer1000Views: 850,
        minimumViews: 1000,
        deadline: new Date(Date.now() + 86400000 * 7),
        status: CampaignStatus.PUBLISHED,
      },
    });

    // 2. Create applications for all 11 editors
    const applicationIds: string[] = [];
    for (let i = 0; i < 11; i++) {
      const appRecord = await prisma.campaignApplication.create({
        data: {
          campaignId: campaign.id,
          editorId: editorIds[i],
          status: ApplicationStatus.PENDING,
          message: `Application from editor ${i + 1}`,
        },
      });
      applicationIds.push(appRecord.id);
    }

    // 3. Approve first 9 applications sequentially
    for (let i = 0; i < 9; i++) {
      const approveRes = await request(app)
        .post(`/api/v1/applications/${applicationIds[i]}/approve`)
        .set("Authorization", `Bearer ${creatorToken}`)
        .send();
      expect(approveRes.status).toBe(200);
      expect(approveRes.body.data.status).toBe("APPROVED");
    }

    // Verify 9 are approved, 1 slot remains
    const appCountBeforeRace = await prisma.campaignApplication.count({
      where: { campaignId: campaign.id, status: ApplicationStatus.APPROVED },
    });
    expect(appCountBeforeRace).toBe(9);

    // 4. Concurrently attempt to approve 10th and 11th applications
    const [resA, resB] = await Promise.all([
      request(app)
        .post(`/api/v1/applications/${applicationIds[9]}/approve`)
        .set("Authorization", `Bearer ${creatorToken}`)
        .send(),
      request(app)
        .post(`/api/v1/applications/${applicationIds[10]}/approve`)
        .set("Authorization", `Bearer ${creatorToken}`)
        .send(),
    ]);

    const statuses = [resA.status, resB.status];
    expect(statuses).toContain(200);
    expect(statuses).toContain(409); // Conflict - slots full

    // 5. Database check: exactly 10 are APPROVED, not 11
    const finalApprovedCount = await prisma.campaignApplication.count({
      where: { campaignId: campaign.id, status: ApplicationStatus.APPROVED },
    });
    expect(finalApprovedCount).toBe(10);
  });

  it("calculates view-based reward and caps at maximumEditorEarning upon verification and wallet credit", async () => {
    // 1. Create a campaign with ₹1,000 fund, 10 slots (₹85 max per editor), ₹8.50 per 1k views
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[SLOT_TEST] View Reward Campaign",
        description: "View-based payout verification",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 8500,
        campaignFund: 100000,
        platformFeePercentage: 15,
        platformFee: 15000,
        editorRewardPool: 85000,
        editorSlots: 10,
        maximumEditorEarning: 8500,
        earningPer1000Views: 850,
        minimumViews: 1000,
        deadline: new Date(Date.now() + 86400000 * 7),
        status: CampaignStatus.PUBLISHED,
      },
    });

    const approvedEditorId = editorIds[0];
    const approvedEditorToken = editorTokens[0];

    // Create approved application
    await prisma.campaignApplication.create({
      data: {
        campaignId: campaign.id,
        editorId: approvedEditorId,
        status: ApplicationStatus.APPROVED,
      },
    });

    // Editor creates approved content submission
    const submission = await prisma.contentSubmission.create({
      data: {
        campaignId: campaign.id,
        editorId: approvedEditorId,
        contentUrl: "https://drive.google.com/test-vid",
        status: SubmissionStatus.APPROVED,
      },
    });

    // Editor submits published post
    const postRes = await request(app)
      .post("/api/v1/published-posts")
      .set("Authorization", `Bearer ${approvedEditorToken}`)
      .send({
        submissionId: submission.id,
        postUrl: "https://instagram.com/p/testviewreward",
        platform: "Instagram",
      });
    expect(postRes.status).toBe(201);
    const postId = postRes.body.data.id;

    // Creator verifies post with 5,000 views
    // 5,000 views * (850 paise / 1,000) = 4,250 paise net
    const verifyRes1 = await request(app)
      .post(`/api/v1/published-posts/${postId}/verify`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({
        verificationNotes: "Approved 5k views",
        verifiedViews: 5000,
      });
    expect(verifyRes1.status).toBe(200);

    const rewardRecord1 = await prisma.reward.findUnique({
      where: { publishedPostId: postId },
    });
    expect(rewardRecord1).not.toBeNull();
    expect(rewardRecord1?.verifiedViews).toBe(5000);
    expect(rewardRecord1?.netAmount).toBe(4250); // ₹42.50
    expect(rewardRecord1?.grossAmount).toBe(5000); // 4250 / 0.85 = 5000 paise gross
    expect(rewardRecord1?.platformFee).toBe(750); // 5000 - 4250 = 750 paise platform fee

    // Creator updates verified views to 50,000 views (exceeds cap of ₹85)
    // 50,000 * 8.50 = ₹425, but cap is ₹85 (8,500 paise)
    const updateViewsRes = await request(app)
      .post(`/api/v1/rewards/${rewardRecord1!.id}/views`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send({ verifiedViews: 50000 });
    expect(updateViewsRes.status).toBe(200);

    const rewardRecord2 = await prisma.reward.findUnique({
      where: { publishedPostId: postId },
    });
    expect(rewardRecord2?.verifiedViews).toBe(50000);
    expect(rewardRecord2?.calculatedAmount).toBe(42500); // calculated 42,500 paise
    expect(rewardRecord2?.netAmount).toBe(8500); // strictly capped at 8,500 paise (₹85.00)

    // Creator approves the reward -> credits wallet
    const approveRewardRes = await request(app)
      .post(`/api/v1/rewards/${rewardRecord1!.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send();
    expect(approveRewardRes.status).toBe(200);
    expect(approveRewardRes.body.data.status).toBe(RewardStatus.CREDITED);

    // Verify editor wallet balance updated by exact netAmount (8,500 paise)
    const editorWallet = await prisma.wallet.findUnique({
      where: { userId: approvedEditorId },
    });
    expect(editorWallet?.balance).toBe(8500);

    // Concurrent double-release prevention: attempting to approve again fails
    const secondApproval = await request(app)
      .post(`/api/v1/rewards/${rewardRecord1!.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`)
      .send();
    expect([400, 409]).toContain(secondApproval.status);
  });
});
