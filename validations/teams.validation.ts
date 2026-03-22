import { z } from "zod";

export const teamValidation = z.object({
  name: z.string().min(2).max(30).nonempty("Name is required"),
  slug: z.string().min(2).max(30).nonempty("Slug is required"),
  description: z.string().optional().nullable(),
  personalTeam: z.boolean(),
  teamleadId: z.string().nonempty("Teamlead ID is required"),
  companyId: z.string().nonempty("Company ID is required"),
});

export const teamMembersValidation = z.object({
  teamId: z.string().nonempty("Team ID is required"),
  userId: z.string().nonempty("User ID is required"),
  role: z.string().nonempty("Role is required"),
});

export type Team = z.infer<typeof teamValidation>;
