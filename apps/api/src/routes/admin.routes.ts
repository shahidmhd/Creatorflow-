import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { requireAdmin } from "../middleware/role";
import { adminService } from "../services/admin.service";
import { auditLogService } from "../services/audit-log.service";
import { success } from "../utils/response";
import { z } from "zod";
import { validate } from "../middleware/validate";

const settingSchema = z.object({ value: z.string().min(1) });
const idSchema = z.object({ id: z.string().uuid() });

export const adminRoutes = Router();

// All admin routes require ADMIN role
adminRoutes.use(authenticate, requireAdmin);

/** GET /api/v1/admin/stats */
adminRoutes.get("/stats", async (_req, res, next) => {
  try {
    const stats = await adminService.getStats();
    success(res, stats);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/users */
adminRoutes.get("/users", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const role = req.query.role as string | undefined;
    const result = await adminService.getUsers(page, limit, role);
    success(res, result);
  } catch (err) { next(err); }
});

/** POST /api/v1/admin/users/:id/toggle-active */
adminRoutes.post("/users/:id/toggle-active", validate(idSchema, "params"), async (req, res, next) => {
  try {
    const user = await adminService.toggleUserActive(req.params.id);
    success(res, user);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/campaigns */
adminRoutes.get("/campaigns", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.getAllCampaigns(page, limit);
    success(res, result);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/rewards */
adminRoutes.get("/rewards", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.getAllRewards(page, limit);
    success(res, result);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/settings */
adminRoutes.get("/settings", async (_req, res, next) => {
  try {
    const settings = await adminService.getAllSettings();
    success(res, settings);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/settings/:key */
adminRoutes.get("/settings/:key", async (req, res, next) => {
  try {
    const value = await adminService.getSetting(req.params.key);
    success(res, { key: req.params.key, value });
  } catch (err) { next(err); }
});

/** PUT /api/v1/admin/settings/:key */
adminRoutes.put("/settings/:key", validate(settingSchema), async (req, res, next) => {
  try {
    const setting = await adminService.setSetting(req.params.key, (req.body as { value: string }).value);
    success(res, setting);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/reports */
adminRoutes.get("/reports", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 20);
    const result = await adminService.getReports(page, limit);
    success(res, result);
  } catch (err) { next(err); }
});

/** POST /api/v1/admin/reports/:id/resolve */
adminRoutes.post("/reports/:id/resolve", validate(idSchema, "params"), async (req, res, next) => {
  try {
    const report = await adminService.resolveReport(req.params.id);
    success(res, report);
  } catch (err) { next(err); }
});

/** GET /api/v1/admin/audit-logs */
adminRoutes.get("/audit-logs", async (req, res, next) => {
  try {
    const page = Number(req.query.page ?? 1);
    const limit = Number(req.query.limit ?? 50);
    const entity = req.query.entity as string | undefined;
    const result = await auditLogService.findAll({ entity, page, limit });
    success(res, result);
  } catch (err) { next(err); }
});
