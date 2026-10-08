import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireCreator, requireAdmin } from "../middleware/role";
import { validate } from "../middleware/validate";
import { campaignService } from "../services/campaign.service";
import { createCampaignSchema, updateCampaignSchema, campaignQuerySchema, campaignIdSchema } from "../validators/campaign.validator";
import { success, created, noContent, paginated } from "../utils/response";
import { AuthRequest } from "../types";
import { CampaignStatus } from "@prisma/client";
import { z } from "zod";

export const campaignRoutes = Router();

/** GET /api/v1/campaigns — public (published) or creator's own */
campaignRoutes.get("/", validate(campaignQuerySchema, "query"), async (req, res, next) => {
  try {
    const query = req.query as unknown as { status?: CampaignStatus; page?: string; limit?: string; socialPlatform?: string };
    const effectiveStatus = query.status ?? CampaignStatus.PUBLISHED;
    const pageNum = Number(query.page ?? 1);
    const limitNum = Number(query.limit ?? 20);
    const result = await campaignService.findAll({
      status: effectiveStatus,
      socialPlatform: query.socialPlatform,
      page: pageNum,
      limit: limitNum,
    });
    paginated(res, result.campaigns, { page: result.page, limit: result.limit, total: result.total });
  } catch (err) { next(err); }
});

/** GET /api/v1/campaigns/mine — creator's own campaigns */
campaignRoutes.get("/mine", authenticate, requireCreator, async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status } = req.query as { page?: number; limit?: number; status?: CampaignStatus };
    const result = await campaignService.findAll({ creatorId: (req as AuthRequest).user.id, status, page: Number(page), limit: Number(limit) });
    paginated(res, result.campaigns, { page: result.page, limit: result.limit, total: result.total });
  } catch (err) { next(err); }
});

/** POST /api/v1/campaigns */
campaignRoutes.post("/", authenticate, requireCreator, validate(createCampaignSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof createCampaignSchema>;
    const campaign = await campaignService.create((req as AuthRequest).user.id, { ...data, deadline: new Date(data.deadline) });
    created(res, campaign);
  } catch (err) { next(err); }
});

/** GET /api/v1/campaigns/:id */
campaignRoutes.get("/:id", validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    const campaign = await campaignService.findById(req.params.id);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** PATCH /api/v1/campaigns/:id */
campaignRoutes.patch("/:id", authenticate, requireCreator, validate(campaignIdSchema, "params"), validate(updateCampaignSchema), async (req, res, next) => {
  try {
    const data = req.body as z.infer<typeof updateCampaignSchema>;
    const updatePayload: Record<string, unknown> = { ...data };
    if (data.deadline) {
      updatePayload.deadline = new Date(data.deadline as string);
    }
    const campaign = await campaignService.update(req.params.id, (req as AuthRequest).user.id, updatePayload as never);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** POST /api/v1/campaigns/:id/publish */
campaignRoutes.post("/:id/publish", authenticate, requireCreator, validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    const campaign = await campaignService.transition(req.params.id, (req as AuthRequest).user.id, CampaignStatus.PUBLISHED);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** POST /api/v1/campaigns/:id/pause */
campaignRoutes.post("/:id/pause", authenticate, requireCreator, validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    const campaign = await campaignService.transition(req.params.id, (req as AuthRequest).user.id, CampaignStatus.PAUSED);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** POST /api/v1/campaigns/:id/complete */
campaignRoutes.post("/:id/complete", authenticate, requireCreator, validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    const campaign = await campaignService.transition(req.params.id, (req as AuthRequest).user.id, CampaignStatus.COMPLETED);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** POST /api/v1/campaigns/:id/cancel */
campaignRoutes.post("/:id/cancel", authenticate, requireCreator, validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    const campaign = await campaignService.transition(req.params.id, (req as AuthRequest).user.id, CampaignStatus.CANCELLED);
    success(res, campaign);
  } catch (err) { next(err); }
});

/** DELETE /api/v1/campaigns/:id */
campaignRoutes.delete("/:id", authenticate, requireCreator, validate(campaignIdSchema, "params"), async (req, res, next) => {
  try {
    await campaignService.delete(req.params.id, (req as AuthRequest).user.id);
    noContent(res);
  } catch (err) { next(err); }
});
