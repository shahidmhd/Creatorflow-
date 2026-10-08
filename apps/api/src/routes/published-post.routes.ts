import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireEditor, requireCreator } from "../middleware/role";
import { publishedPostService } from "../services/published-post.service";
import { success, created } from "../utils/response";
import { AuthRequest } from "../types";
import { z } from "zod";
import { validate } from "../middleware/validate";

const submitSchema = z.object({
  submissionId: z.string().uuid(),
  postUrl: z.string().url("Must be a valid URL"),
  platform: z.string().min(1).max(50),
});
const idSchema = z.object({ id: z.string().uuid() });
const verifySchema = z.object({
  verificationNotes: z.string().max(1000).optional(),
  verifiedViews: z.coerce.number().int().nonnegative().optional().default(0),
});
const rejectSchema = z.object({ verificationNotes: z.string().min(1).max(1000) });

export const publishedPostRoutes = Router();

/** POST /api/v1/published-posts — editor submits published URL */
publishedPostRoutes.post("/", authenticate, requireEditor, validate(submitSchema), async (req, res, next) => {
  try {
    const { submissionId, postUrl, platform } = req.body as z.infer<typeof submitSchema>;
    const post = await publishedPostService.submit((req as AuthRequest).user.id, submissionId, postUrl, platform);
    created(res, post);
  } catch (err) { next(err); }
});

/** GET /api/v1/published-posts/mine */
publishedPostRoutes.get("/mine", authenticate, requireEditor, async (req, res, next) => {
  try {
    const posts = await publishedPostService.findByEditor((req as AuthRequest).user.id);
    success(res, posts);
  } catch (err) { next(err); }
});

/** GET /api/v1/published-posts/campaign/:campaignId */
publishedPostRoutes.get("/campaign/:campaignId", authenticate, requireCreator, validate(z.object({ campaignId: z.string().uuid() }), "params"), async (req, res, next) => {
  try {
    const posts = await publishedPostService.findByCampaign(req.params.campaignId, (req as AuthRequest).user.id);
    success(res, posts);
  } catch (err) { next(err); }
});

/** GET /api/v1/published-posts/:id */
publishedPostRoutes.get("/:id", authenticate, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const post = await publishedPostService.findById(req.params.id);
    success(res, post);
  } catch (err) { next(err); }
});

/** POST /api/v1/published-posts/:id/verify */
publishedPostRoutes.post("/:id/verify", authenticate, requireCreator, validate(idSchema, "params"), validate(verifySchema), async (req, res, next) => {
  try {
    const body = req.body as { verificationNotes?: string; verifiedViews?: number };
    const post = await publishedPostService.verify(
      req.params.id,
      (req as AuthRequest).user.id,
      body.verificationNotes,
      body.verifiedViews ?? 0
    );
    success(res, post);
  } catch (err) { next(err); }
});

/** POST /api/v1/published-posts/:id/reject */
publishedPostRoutes.post("/:id/reject", authenticate, requireCreator, validate(idSchema, "params"), validate(rejectSchema), async (req, res, next) => {
  try {
    const post = await publishedPostService.reject(req.params.id, (req as AuthRequest).user.id, (req.body as { verificationNotes: string }).verificationNotes);
    success(res, post);
  } catch (err) { next(err); }
});
