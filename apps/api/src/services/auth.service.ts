import { prisma } from "../repositories/prisma";
import { NotFoundError, ConflictError } from "../errors";
import { Role } from "@prisma/client";
import { walletService } from "./wallet.service";
import { notificationService } from "./notification.service";
import { auditLogService } from "./audit-log.service";

export const authService = {
  async getOrCreateUser(supabaseId: string, email: string, name: string, username: string, role: Role, password?: string) {
    const existing = await prisma.user.findUnique({ where: { supabaseId } });
    if (existing) return existing;

    // Check username uniqueness
    const takenUsername = await prisma.user.findUnique({ where: { username } });
    if (takenUsername) throw new ConflictError("Username is already taken");

    const takenEmail = await prisma.user.findUnique({ where: { email } });
    if (takenEmail) throw new ConflictError("Email is already registered");

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { supabaseId, email, name, username, role, passwordHash: password },
      });

      // Create role-specific profile
      if (role === Role.CREATOR) {
        await tx.creatorProfile.create({ data: { userId: newUser.id } });
      } else if (role === Role.EDITOR) {
        await tx.editorProfile.create({ data: { userId: newUser.id } });
      }

      // Create wallet
      await tx.wallet.create({ data: { userId: newUser.id } });

      return newUser;
    });

    await auditLogService.log(user.id, "USER_REGISTERED", "User", user.id, null, { role });
    return user;
  },

  async login(usernameOrEmail: string, password: string) {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { username: usernameOrEmail },
          { email: usernameOrEmail },
        ],
      },
    });

    if (!user) {
      throw new NotFoundError("No account found with this username or email");
    }

    if (!user.isActive) {
      throw new ConflictError("This account is suspended");
    }

    if (!user.passwordHash || user.passwordHash !== password) {
      throw new ConflictError("Incorrect password");
    }

    return user;
  },

  async getUser(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { creatorProfile: true, editorProfile: true },
    });
    if (!user) throw new NotFoundError("User");
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; avatarUrl?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });
    await auditLogService.log(userId, "PROFILE_UPDATED", "User", userId, null, data);
    return user;
  },

  async updateCreatorProfile(userId: string, data: { bio?: string; website?: string; socialLinks?: object }) {
    const profile = await prisma.creatorProfile.update({
      where: { userId },
      data,
    });
    return profile;
  },

  async updateEditorProfile(userId: string, data: { bio?: string; skills?: string[]; portfolio?: object; socialLinks?: object }) {
    const profile = await prisma.editorProfile.update({
      where: { userId },
      data,
    });
    return profile;
  },
};
