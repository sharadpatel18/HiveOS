import { ROLES } from "@/types/role";
import { z } from "zod";

export const companyValidation = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not exceed 30 characters")
    .nonempty("Name is required"),

  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(30, "Slug must not exceed 30 characters")
    .nonempty("Slug is required"),

  description: z.string().nonempty("Description is required"),
  size: z.string().nonempty("Size is required"),
  founder: z.string().nonempty("Founder is required"),

  website: z.string().optional(),
  industry: z.string().optional(),
});

export const companyMembersValidation = z.object({
  userId: z.string().nonempty("User ID is required"),
  companyId: z.string().nonempty("Company ID is required"),
  role: z.nativeEnum(ROLES, {
    errorMap: () => ({ message: "Role is required" }),
  }),
  hiredBy: z.string().nonempty("hiredBy is required"),
});

export const companyInvitesValidation = z.object({
  companyId: z.string().nonempty("Company ID is required"),
  email: z.string().email("Invalid email").nonempty("Email is required"),
  role: z.nativeEnum(ROLES, {
    errorMap: () => ({ message: "Role is required" }),
  }),
});

export const companyJoinValidation = z.object({
  token: z.string().nonempty("Token is required"),
  role: z.nativeEnum(ROLES, {
    errorMap: () => ({ message: "Role is required" }),
  }),
  id: z.string().nonempty("ID is required"),
});

export type Company = z.infer<typeof companyValidation>;
export type CompanyMembers = z.infer<typeof companyMembersValidation>;
export type CompanyInvites = z.infer<typeof companyInvitesValidation>;
export type CompanyJoin = z.infer<typeof companyJoinValidation>;
