import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "../repositories/prisma";
import { UnauthorizedError } from "../errors";
import { AuthRequest } from "../types";
import { config } from "../config";

let supabaseClient: ReturnType<typeof createClient> | null = null;
function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(config.supabase.url, config.supabase.anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return supabaseClient;
}

export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      throw new UnauthorizedError("Missing authorization token");
    }

    const token = authHeader.slice(7);

    // 1. Support local development tokens (e.g. creatorflow_token_<userId>)
    if (token.startsWith("creatorflow_token_") || token.startsWith("mock_jwt_token_")) {
      const rawId = token.replace("creatorflow_token_", "").replace("mock_jwt_token_", "").trim();
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { id: rawId },
            { username: rawId },
          ],
        },
        select: { id: true, supabaseId: true, email: true, name: true, username: true, role: true, isActive: true },
      });

      if (!user) {
        throw new UnauthorizedError("User session not found in database. Please log in again.");
      }
      if (!user.isActive) {
        throw new UnauthorizedError("Account is deactivated");
      }
      (req as AuthRequest).user = user;
      next();
      return;
    }

    // 2. Verify JWT with Supabase (Production)
    if (config.supabase.url && !config.supabase.url.includes("your-project")) {
      const { data, error } = await getSupabaseClient().auth.getUser(token);
      if (error || !data.user) {
        throw new UnauthorizedError("Invalid or expired token");
      }

      const user = await prisma.user.findUnique({
        where: { supabaseId: data.user.id },
        select: { id: true, supabaseId: true, email: true, name: true, username: true, role: true, isActive: true },
      });

      if (!user) throw new UnauthorizedError("User account not found");
      if (!user.isActive) throw new UnauthorizedError("Account is deactivated");

      (req as AuthRequest).user = user;
      next();
      return;
    }

    throw new UnauthorizedError("Invalid or expired token");
  } catch (err) {
    next(err);
  }
}
