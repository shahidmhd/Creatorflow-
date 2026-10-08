import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import { app } from "../../app";
import { prisma } from "../../repositories/prisma";
import { CampaignStatus } from "@prisma/client";

describe("Authentication & Authorization Integration Tests", () => {
  let creator1Id: string;
  let creator2Id: string;
  let editorId: string;
  let creator1Token: string;
  let creator2Token: string;
  let editorToken: string;

  beforeAll(async () => {
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[AUTH_TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[AUTH_TEST]" } } });
    await prisma.user.deleteMany({
      where: { email: { in: ["test_auth_c1@test.com", "test_auth_c2@test.com", "test_auth_ed@test.com"] } },
    });

    const c1 = await prisma.user.create({
      data: {
        supabaseId: "auth-test-c1",
        email: "test_auth_c1@test.com",
        name: "Creator 1",
        username: "creator1_auth",
        role: "CREATOR",
      },
    });
    creator1Id = c1.id;
    creator1Token = `creatorflow_token_${c1.id}`;

    const c2 = await prisma.user.create({
      data: {
        supabaseId: "auth-test-c2",
        email: "test_auth_c2@test.com",
        name: "Creator 2",
        username: "creator2_auth",
        role: "CREATOR",
      },
    });
    creator2Id = c2.id;
    creator2Token = `creatorflow_token_${c2.id}`;

    const ed = await prisma.user.create({
      data: {
        supabaseId: "auth-test-ed",
        email: "test_auth_ed@test.com",
        name: "Editor 1",
        username: "editor_auth",
        role: "EDITOR",
      },
    });
    editorId = ed.id;
    editorToken = `creatorflow_token_${ed.id}`;
  });

  afterAll(async () => {
    await prisma.campaignApplication.deleteMany({ where: { campaign: { title: { startsWith: "[AUTH_TEST]" } } } });
    await prisma.campaign.deleteMany({ where: { title: { startsWith: "[AUTH_TEST]" } } });
    await prisma.user.deleteMany({ where: { id: { in: [creator1Id, creator2Id, editorId] } } });
    await prisma.$disconnect();
  });

  it("rejects unauthenticated requests with 401", async () => {
    const res = await request(app).post("/api/v1/applications").send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("rejects invalid or forged bearer tokens with 401", async () => {
    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", "Bearer invalid-garbage-token-12345")
      .send({});
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("enforces role boundaries: Editor cannot create campaigns (403)", async () => {
    const res = await request(app)
      .post("/api/v1/campaigns")
      .set("Authorization", `Bearer ${editorToken}`)
      .send({
        title: "[AUTH_TEST] Editor Try Create",
        description: "Test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 50000,
        deadline: new Date(Date.now() + 86400000).toISOString(),
      });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("action requires one of these roles");
  });

  it("enforces role boundaries: Creator cannot apply to campaigns (403)", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        creatorId: creator1Id,
        title: "[AUTH_TEST] Creator Apply Campaign",
        description: "Test",
        category: "Tech",
        socialPlatform: "Instagram",
        rewardAmount: 50000,
        deadline: new Date(Date.now() + 86400000),
        status: CampaignStatus.PUBLISHED,
      },
    });

    const res = await request(app)
      .post("/api/v1/applications")
      .set("Authorization", `Bearer ${creator1Token}`)
      .send({ campaignId: campaign.id, message: "Should fail" });

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("action requires one of these roles");
  });

  it("enforces ownership: Creator cannot manage another Creator's campaign applications (403)", async () => {
    const campaign = await prisma.campaign.create({
      data: {
        creatorId: creator1Id,
        title: "[AUTH_TEST] Creator 1 Campaign",
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
      },
    });

    // Creator 2 attempts to approve Creator 1's campaign application
    const res = await request(app)
      .post(`/api/v1/applications/${appRecord.id}/approve`)
      .set("Authorization", `Bearer ${creator2Token}`);

    expect(res.status).toBe(403);
    expect(res.body.error).toContain("do not own this campaign");
  });
});
