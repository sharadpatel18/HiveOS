import { ROLES } from "@/types/role";
import { z } from "zod";

export const signupValidation = z.object({
  name: z.string().min(2).max(30).nonempty("Name is required"),
  email: z.email().nonempty("Email is required"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/^[A-Z]/, "Password must start with an uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[@$!%*?&]/,
      "Password must contain at least one special character (@ $ ! % * ? &)",
    ),
  role: z.enum(ROLES).nonoptional("Role is required"),
});

export const loginValidation = z.object({
  email: z.email().nonempty("Email is required"),
  password: z.string().nonempty("Password is required"),
});

export type SignupValidationSchema = z.infer<typeof signupValidation>;
export type LoginValidationSchema = z.infer<typeof loginValidation>;
