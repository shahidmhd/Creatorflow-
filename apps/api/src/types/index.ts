import { Request } from "express";
import { Role } from "@prisma/client";

export interface AuthUser {
  id: string;
  supabaseId: string;
  email: string;
  name: string;
  username: string;
  role: Role;
}

export interface AuthRequest extends Request {
  user: AuthUser;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}
