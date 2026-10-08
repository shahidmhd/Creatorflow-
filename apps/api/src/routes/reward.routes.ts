import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireCreator, requireAdmin } from "../middleware/role";
import { rewardService } from "../services/reward.service";
import { success } from "../utils/response";
import { AuthRequest } from "../types";
import { z } from "zod";
import { validate } from "../middleware/validate";

const idSchema = z.object({ id: z.string().uuid() });

export const rewardRoutes = Router();

/** GET /api/v1/rewards/mine — editor's rewards */
rewardRoutes.get("/mine", authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await rewardService.findByEditor((req as AuthRequest).user.id, page, limit);
    success(res, result);
  } catch (err) { next(err); }
});

/** GET /api/v1/rewards/:id */
rewardRoutes.get("/:id", authenticate, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const reward = await rewardService.findById(req.params.id);
    success(res, reward);
  } catch (err) { next(err); }
});

/** POST /api/v1/rewards/:id/approve — creator approves reward */
rewardRoutes.post("/:id/approve", authenticate, requireCreator, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const reward = await rewardService.approve(req.params.id, (req as AuthRequest).user.id);
    success(res, reward);
  } catch (err) { next(err); }
});

/** POST /api/v1/rewards/:id/views — creator updates verified views on pending reward */
rewardRoutes.post("/:id/views", authenticate, requireCreator, validate(idSchema, "params"), validate(z.object({ verifiedViews: z.coerce.number().int().nonnegative() })), async (req, res, next) => {
  try {
    const { verifiedViews } = req.body as { verifiedViews: number };
    const reward = await rewardService.updateViews(req.params.id, (req as AuthRequest).user.id, verifiedViews);
    success(res, reward);
  } catch (err) { next(err); }
});

/** POST /api/v1/rewards/:id/cancel */
rewardRoutes.post("/:id/cancel", authenticate, validate(idSchema, "params"), async (req, res, next) => {
  try {
    const reward = await rewardService.cancel(req.params.id, (req as AuthRequest).user.id);
    success(res, reward);
  } catch (err) { next(err); }
});
