import { ROLES } from "@/types/role";
import { z } from "zod";

export const signupValidation = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(30, "Name must not exceed 30 characters")
    .nonempty("Name is required"),

  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),

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

  role: z.nativeEnum(ROLES, {
    errorMap: () => ({
      message: "Role is required",
    }),
  }),
});

export const loginValidation = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .nonempty("Email is required"),

  password: z.string().nonempty("Password is required"),
});

export type SignupValidationSchema = z.infer<typeof signupValidation>;
export type LoginValidationSchema = z.infer<typeof loginValidation>;
