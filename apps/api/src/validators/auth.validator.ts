import { z } from "zod";

export const registerSchema = z.object({
  supabaseId: z.string().min(1),
  email: z.string().email(),
  name: z.string().min(2).max(80),
  username: z.string().regex(/^[A-Za-z0-9_]{3,30}$/, "Username must be 3–30 chars: letters, numbers, underscores"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["CREATOR", "EDITOR"]),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).max(80).optional(),
  avatarUrl: z.string().url().optional(),
});

export const updateCreatorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal("")),
  socialLinks: z.record(z.string()).optional(),
});

export const updateEditorProfileSchema = z.object({
  bio: z.string().max(500).optional(),
  skills: z.array(z.string()).optional(),
  portfolio: z.record(z.unknown()).optional(),
  socialLinks: z.record(z.string()).optional(),
});
