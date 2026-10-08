import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireEditor, requireCreator } from "../middleware/role";
import { applicationService } from "../services/application.service";
import { success, created } from "../utils/response";
import { AuthRequest } from "../types";
import { ApplicationStatus } from "@prisma/client";
import { z } from "zod";
import { validate } from "../middleware/validate";

const applySchema = z.object({ campaignId: z.string().uuid(), message: z.string().max(500).optional() });
const idSchema = z.object({ id: z.string().uuid() });
const feedbackSchema = z.object({ notes: z.string().max(500).optional() });

export const applicationRoutes = Router();

/** POST /api/v1/applications — editor applies */
applicationRoutes.post("/", authenticate, requireEditor, validate(applySchema), async (req, res, next) => {
  try {
    const { campaignId, message } = req.body as { campaignId: string; message?: string };
    const app = await applicationService.apply((req as AuthRequest).user.id, campaignId, message);
    created(res, app);
  } catch (err) { next(err); }
});

/** GET /api/v1/applications/mine — editor's applications */
applicationRoutes.get("/mine", authenticate, requireEditor, async (req, res, next) => {
  try {
    const apps = await applicationService.findByEditor((req as AuthRequest).user.id);
    success(res, apps);
  } catch (err) { next(err); }
});

/** GET /api/v1/applications/campaign/:campaignId — creator sees applications for their campaign */
applicationRoutes.get("/campaign/:campaignId", authenticate, requireCreator, validate(z.object({ campaignId: z.string().uuid() }), "params"), async (req, res, next) => {
  try {
    const apps = await applicationService.findByCampaign(req.params.campaignId, (req as AuthRequest).user.id);
    success(res, apps);
  } catch (err) { next(err); }
});

/** POST /api/v1/applications/:id/approve */
applicationRoutes.post("/:id/approve", authenticate, requireCreator, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const app = await applicationService.transition(req.params.id, (req as AuthRequest).user.id, ApplicationStatus.APPROVED, "CREATOR");
    success(res, app);
  } catch (err) { next(err); }
});

/** POST /api/v1/applications/:id/reject */
applicationRoutes.post("/:id/reject", authenticate, requireCreator, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const app = await applicationService.transition(req.params.id, (req as AuthRequest).user.id, ApplicationStatus.REJECTED, "CREATOR");
    success(res, app);
  } catch (err) { next(err); }
});

/** POST /api/v1/applications/:id/withdraw */
applicationRoutes.post("/:id/withdraw", authenticate, requireEditor, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const app = await applicationService.transition(req.params.id, (req as AuthRequest).user.id, ApplicationStatus.WITHDRAWN, "EDITOR");
    success(res, app);
  } catch (err) { next(err); }
});
