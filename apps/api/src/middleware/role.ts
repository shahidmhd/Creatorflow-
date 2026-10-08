import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";
import { ForbiddenError } from "../errors";
import { AuthRequest } from "../types";

export function requireRole(...roles: Role[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const user = (req as AuthRequest).user;
    if (!user) {
      next(new ForbiddenError("Authentication required"));
      return;
    }
    if (!roles.includes(user.role)) {
      next(new ForbiddenError(`This action requires one of these roles: ${roles.join(", ")}`));
      return;
    }
    next();
  };
}

export const requireCreator = requireRole(Role.CREATOR);
export const requireEditor = requireRole(Role.EDITOR);
export const requireAdmin = requireRole(Role.ADMIN);
export const requireCreatorOrAdmin = requireRole(Role.CREATOR, Role.ADMIN);
export const requireEditorOrAdmin = requireRole(Role.EDITOR, Role.ADMIN);
