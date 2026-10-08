import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { notificationService } from "../services/notification.service";
import { success } from "../utils/response";
import { AuthRequest } from "../types";
import { z } from "zod";
import { validate } from "../middleware/validate";

const idSchema = z.object({ id: z.string().uuid() });

export const notificationRoutes = Router();

/** GET /api/v1/notifications */
notificationRoutes.get("/", authenticate, async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await notificationService.getForUser((req as AuthRequest).user.id, page, limit);
    success(res, result);
  } catch (err) { next(err); }
});

/** GET /api/v1/notifications/unread-count */
notificationRoutes.get("/unread-count", authenticate, async (req, res, next) => {
  try {
    const count = await notificationService.getUnreadCount((req as AuthRequest).user.id);
    success(res, { count });
  } catch (err) { next(err); }
});

/** POST /api/v1/notifications/:id/read */
notificationRoutes.post("/:id/read", authenticate, validate(idSchema, "params"), async (req, res, next) => {
  try {
    await notificationService.markRead(req.params.id, (req as AuthRequest).user.id);
    success(res, { ok: true });
  } catch (err) { next(err); }
});

/** POST /api/v1/notifications/read-all */
notificationRoutes.post("/read-all", authenticate, async (req, res, next) => {
  try {
    await notificationService.markAllRead((req as AuthRequest).user.id);
    success(res, { ok: true });
  } catch (err) { next(err); }
});
