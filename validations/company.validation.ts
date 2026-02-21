import { ROLES } from "@/types/role";
import { z } from "zod";

export const companyValidation = z.object({
  name: z.string().min(2).max(30).nonempty("Name is required"),
  slug: z.string().min(2).max(30).nonempty("Slug is required"),
  description: z.string().nonempty("Description is required"),
  size: z.string().nonempty("Size is required"),
  founder: z.string().nonempty("Founder is required"),
  website: z.string().optional(),
  industry: z.string().optional(),
});

export const companyMembersValidation = z.object({
  companyId: z.string().nonempty("Company ID is required"),
  role: z.enum(ROLES).nonoptional("Role is required"),
});

export type Company = z.infer<typeof companyValidation>;
export type CompanyMembers = z.infer<typeof companyMembersValidation>;
