import { z } from "zod";

export const signupSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
});

export const loginSchema = z.object({
  email: z.email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
