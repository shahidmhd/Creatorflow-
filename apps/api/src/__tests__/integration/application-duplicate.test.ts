import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../repositories/prisma";
import { CampaignStatus, ApplicationStatus } from "@prisma/client";

describe("Application Duplication & Concurrency Integration Tests", () => {
  let creatorId: string;
  let editorId: string;
  let creatorToken: string;
  let editorToken: string;

  beforeAll(async () => {
    // Clean up test data from any previous runs
    await prisma.reward.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.publishedPost.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.contentSubmission.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[TEST]" } } });
    await prisma.user.deleteMany({ where: { email: { in: ["test_app_creator@test.com", "test_app_editor@test.com"] } } });

    // Create test Creator
    const creator = await prisma.user.create({
      data: {
        supabaseId: "test-creator-sub-id",
        email: "test_app_creator@test.com",
        name: "Test Creator",
        username: "testcreator_app",
        role: "CREATOR",
      },
    });
    creatorId = creator.id;
    creatorToken = `creatorflow_token_${creator.id}`;

    // Create test Editor
    const editor = await prisma.user.create({
      data: {
        supabaseId: "test-editor-sub-id",
        email: "test_app_editor@test.com",
        name: "Test Editor",
        username: "testeditor_app",
        role: "EDITOR",
      },
    });
    editorId = editor.id;
    editorToken = `creatorflow_token_${editor.id}`;
  });

  afterAll(async () => {
    await prisma.reward.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.publishedPost.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.contentSubmission.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[TEST]" } } });
    await prisma.user.deleteMany({ where: { id: { in: [creatorId, editorId] } } });
    await prisma.$disconnect();
  });

  it("prevents sequential duplicate applications with 409 and APPLICATION_ALREADY_EXISTS code", async () => {
    // Create published campaign
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[TEST] Sequential Apply Campaign",
        description: "Test description",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 100000,
        deadline: new Date(Date.now() + 86400000 * 7),
        status: CampaignStatus.PUBLISHED,
      },
    });

    // 1st application: should succeed (201)
    const res1 = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ campaignId: campaign.id, message: "First application pitch" });

    expect(res1.status).toBe(201);
    expect(res1.body.success).toBe(true);
    expect(res1.body.data.campaignId).toBe(campaign.id);
    expect(res1.body.data.editorId).toBe(editorId);

    // 2nd application: should fail with 409 Conflict
    const res2 = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ campaignId: campaign.id, message: "Second duplicate application" });

    expect(res2.status).toBe(409);
    expect(res2.body.success).toBe(false);
    expect(res2.body.code).toBe("APPLICATION_ALREADY_EXISTS");
    expect(res2.body.error).toBe("You have already applied to this campaign.");

    // Verify DB count is exactly 1
    const count = await prisma.campaignApplication.count({
      where: { campaignId: campaign.id, editorId },
    });
    expect(count).toBe(1);
  });

  it("handles race conditions: concurrent applications produce exactly ONE record and return 409 for others", async () => {
    // Create new published campaign
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[TEST] Concurrent Apply Race Condition",
        description: "Test concurrency",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 100000,
        deadline: new Date(Date.now() + 86400000 * 7),
        status: CampaignStatus.PUBLISHED,
      },
    });

    // Fire 3 simultaneous apply requests
    const results = await Promise.all([
      request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ campaignId: campaign.id, message: "Concurrent 1" }),
      request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ campaignId: campaign.id, message: "Concurrent 2" }),
      request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ campaignId: campaign.id, message: "Concurrent 3" }),
    ]);

    const successes = results.filter((r) => r.status === 201);
    const conflicts = results.filter((r) => r.status === 409);

    expect(successes.length).toBe(1);
    expect(conflicts.length).toBe(2);

    for (const conflict of conflicts) {
      expect(conflict.body.code).toBe("APPLICATION_ALREADY_EXISTS");
      expect(conflict.body.error).toBe("You have already applied to this campaign.");
    }

    // Verify DB has strictly 1 application record
    const count = await prisma.campaignApplication.count({
      where: { campaignId: campaign.id, editorId },
    });
    expect(count).toBe(1);
  });

  it("rejects applying to non-published campaigns (DRAFT, PAUSED, CANCELLED, COMPLETED, EXPIRED)", async () => {
    const statuses = [
      CampaignStatus.DRAFT,
      CampaignStatus.PAUSED,
      CampaignStatus.CANCELLED,
      CampaignStatus.COMPLETED,
    ];

    for (const status of statuses) {
      const camp = await prisma.campaign.create({
        data: {
          creatorId,
          title: `[TEST] Campaign Status ${status}`,
          description: "Test",
          category: "Tech",
          socialPlatform: "Instagram",
          rewardAmount: 50000,
          deadline: new Date(Date.now() + 86400000),
          status,
        },
      });

      const res = await request(app)
        .post("/api/v1/applications")
        .set("Authorization", `Bearer ${editorToken}`)
        .send({ campaignId: camp.id, message: "Pitch" });

      expect(res.status).toBe(409);
      expect(res.body.error).toContain("Campaign is not open for applications");
    }

    // Expired campaign
    const expiredCamp = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[TEST] Expired Campaign",
        description: "Test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 50000,
        deadline: new Date(Date.now() - 86400000), // yesterday
        status: CampaignStatus.PUBLISHED,
      },
    });

    const resExpired = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({ campaignId: expiredCamp.id, message: "Pitch" });

    expect(resExpired.status).toBe(409);
    expect(resExpired.body.error).toContain("deadline has passed");
  });

  it("enforces valid and invalid application status transitions", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        creatorId,
        title: "[TEST] Status Transitions Campaign",
        description: "Test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 50000,
        deadline: new Date(Date.now() + 86400000),
        status: CampaignStatus.PUBLISHED,
      },
    });

    const appRecord = await prisma.campaignApplication.create({
      data: {
        campaignId: campaign.id,
        editorId,
        status: ApplicationStatus.PENDING,
      },
    });

    // Valid transition: Creator approves application (PENDING -> APPROVED)
    const approveRes = await request(app)
      .post(`/api/v1/applications/${appRecord.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(approveRes.status).toBe(200);
    expect(approveRes.body.data.status).toBe("APPROVED");

    // Invalid transition: Try to approve again (APPROVED -> APPROVED)
    const doubleApprove = await request(app)
      .post(`/api/v1/applications/${appRecord.id}/approve`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(doubleApprove.status).toBe(409);
    expect(doubleApprove.body.error).toContain("Cannot transition from APPROVED to APPROVED");

    // Invalid transition: Creator tries to reject already approved application (APPROVED -> REJECTED)
    const rejectApproved = await request(app)
      .post(`/api/v1/applications/${appRecord.id}/reject`)
      .set("Authorization", `Bearer ${creatorToken}`);

    expect(rejectApproved.status).toBe(409);
    expect(rejectApproved.body.error).toContain("Cannot transition from APPROVED to REJECTED");
  });
});
