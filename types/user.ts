import { NextResponse } from "next/server";
import { Role } from "./role";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type JwtPayload = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

// ─── Types ───────────────────────────────────────────────────────────────────

export type AuthUser = User | null;
