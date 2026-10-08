import { Router } from "express";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { authService } from "../services/auth.service";
import { registerSchema, updateProfileSchema, updateCreatorProfileSchema, updateEditorProfileSchema } from "../validators/auth.validator";
import { success } from "../utils/response";
import { AuthRequest } from "../types";
import { Role } from "@prisma/client";

export const authRoutes = Router();

/** POST /api/v1/auth/register — called from frontend after Supabase signup */
authRoutes.post("/register", validate(registerSchema), async (req, res, next) => {
  try {
    const { supabaseId, email, name, username, password, role } = req.body as {
      supabaseId: string;
      email: string;
      name: string;
      username: string;
      password?: string;
      role: "CREATOR" | "EDITOR";
    };
    const user = await authService.getOrCreateUser(supabaseId, email, name, username, role as Role, password);
    success(res, user, 201);
  } catch (err) { next(err); }
});

/** POST /api/v1/auth/login — authenticates username/password against database */
authRoutes.post("/login", async (req, res, next) => {
  try {
    const { username, password } = req.body as { username?: string; password?: string };
    if (!username || !password) {
      res.status(422).json({ success: false, error: "Username and password are required" });
      return;
    }
    const user = await authService.login(username, password);
    success(res, {
      token: "creatorflow_token_" + user.id,
      user: {
        id: user.id,
        supabaseId: user.supabaseId,
        email: user.email,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    });
  } catch (err) { next(err); }
});

/** GET /api/v1/auth/me */
authRoutes.get("/me", authenticate, async (req, res, next) => {
  try {
    const user = await authService.getUser((req as AuthRequest).user.id);
    success(res, user);
  } catch (err) { next(err); }
});

/** PATCH /api/v1/auth/me */
authRoutes.patch("/me", authenticate, validate(updateProfileSchema), async (req, res, next) => {
  try {
    const user = await authService.updateProfile((req as AuthRequest).user.id, req.body as { name?: string; avatarUrl?: string });
    success(res, user);
  } catch (err) { next(err); }
});

/** PATCH /api/v1/auth/profile/creator */
authRoutes.patch("/profile/creator", authenticate, validate(updateCreatorProfileSchema), async (req, res, next) => {
  try {
    const profile = await authService.updateCreatorProfile((req as AuthRequest).user.id, req.body as { bio?: string; website?: string; socialLinks?: object });
    success(res, profile);
  } catch (err) { next(err); }
});

/** PATCH /api/v1/auth/profile/editor */
authRoutes.patch("/profile/editor", authenticate, validate(updateEditorProfileSchema), async (req, res, next) => {
  try {
    const profile = await authService.updateEditorProfile((req as AuthRequest).user.id, req.body as { bio?: string; skills?: string[]; portfolio?: object; socialLinks?: object });
    success(res, profile);
  } catch (err) { next(err); }
});
