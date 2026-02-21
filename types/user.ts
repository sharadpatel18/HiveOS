import { Role } from "./role";

export type User = {
  id: string;
  fullName: string;
  email: string;
  role: Role;
};

export type AuthUser = User | null;
