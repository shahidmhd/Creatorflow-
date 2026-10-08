import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireEditor, requireCreator } from "../middleware/role";
import { submissionService } from "../services/submission.service";
import { success, created } from "../utils/response";
import { AuthRequest } from "../types";
import { SubmissionStatus } from "@prisma/client";
import { z } from "zod";
import { validate } from "../middleware/validate";

const createSchema = z.object({
  campaignId: z.string().uuid(),
  contentUrl: z.string().url(),
  caption: z.string().max(2000).optional(),
  notes: z.string().max(1000).optional(),
});
const idSchema = z.object({ id: z.string().uuid() });
const feedbackSchema = z.object({ feedback: z.string().max(1000).optional() });

export const submissionRoutes = Router();

/** POST /api/v1/submissions */
submissionRoutes.post("/", authenticate, requireEditor, validate(createSchema), async (req, res, next) => {
  try {
    const { campaignId, contentUrl, caption, notes } = req.body as z.infer<typeof createSchema>;
    const sub = await submissionService.create((req as AuthRequest).user.id, campaignId, { contentUrl, caption, notes });
    created(res, sub);
  } catch (err) { next(err); }
});

/** GET /api/v1/submissions/mine */
submissionRoutes.get("/mine", authenticate, requireEditor, async (req, res, next) => {
  try {
    const subs = await submissionService.findByEditor((req as AuthRequest).user.id);
    success(res, subs);
  } catch (err) { next(err); }
});

/** GET /api/v1/submissions/campaign/:campaignId */
submissionRoutes.get("/campaign/:campaignId", authenticate, requireCreator, validate(z.object({ campaignId: z.string().uuid() }), "params"), async (req, res, next) => {
  try {
    const subs = await submissionService.findByCampaign(req.params.campaignId, (req as AuthRequest).user.id);
    success(res, subs);
  } catch (err) { next(err); }
});

/** GET /api/v1/submissions/:id */
submissionRoutes.get("/:id", authenticate, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const sub = await submissionService.findById(req.params.id);
    success(res, sub);
  } catch (err) { next(err); }
});

/** POST /api/v1/submissions/:id/submit */
submissionRoutes.post("/:id/submit", authenticate, requireEditor, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const sub = await submissionService.transition(req.params.id, (req as AuthRequest).user.id, SubmissionStatus.SUBMITTED, "EDITOR");
    success(res, sub);
  } catch (err) { next(err); }
});

/** POST /api/v1/submissions/:id/approve */
submissionRoutes.post("/:id/approve", authenticate, requireCreator, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const sub = await submissionService.transition(req.params.id, (req as AuthRequest).user.id, SubmissionStatus.APPROVED, "CREATOR");
    success(res, sub);
  } catch (err) { next(err); }
});

/** POST /api/v1/submissions/:id/request-changes */
submissionRoutes.post("/:id/request-changes", authenticate, requireCreator, validate(idSchema, "params"), validate(feedbackSchema), async (req, res, next) => {
  try {
    const sub = await submissionService.transition(req.params.id, (req as AuthRequest).user.id, SubmissionStatus.CHANGES_REQUESTED, "CREATOR", (req.body as { feedback?: string }).feedback);
    success(res, sub);
  } catch (err) { next(err); }
});

/** POST /api/v1/submissions/:id/reject */
submissionRoutes.post("/:id/reject", authenticate, requireCreator, validate(idSchema, "params"), validate(feedbackSchema), async (req, res, next) => {
  try {
    const sub = await submissionService.transition(req.params.id, (req as AuthRequest).user.id, SubmissionStatus.REJECTED, "CREATOR", (req.body as { feedback?: string }).feedback);
    success(res, sub);
  } catch (err) { next(err); }
});
