import { z } from "zod";

export const signupSchema = z.object({
  // Basic auth fields
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long"),
  last_name: z.string().min(2, "Last name must be at least 2 characters long"),
  role: z.enum(["CREATOR", "EVENTEE", "ADMIN"], {
    message: "Role must be CREATOR, EVENTEE, or ADMIN",
  }),
  // Optional professional/profile fields
  date_of_birth: z.string().optional(),
  age: z.number().int().min(0).optional(),
  occupation: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  social_profiles: z.record(z.string(), z.string()).optional(),
  is_verified: z.boolean().optional(),
  profile_completed: z.boolean().optional(),
});

export const updateProfileSchema = z.object({
  first_name: z
    .string()
    .min(2, "First name must be at least 2 characters long")
    .optional(),
  last_name: z
    .string()
    .min(2, "Last name must be at least 2 characters long")
    .optional(),
  // Allow updating profile fields
  date_of_birth: z.string().optional(),
  age: z.number().int().min(0).optional(),
  occupation: z.string().optional(),
  job_title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  timezone: z.string().optional(),
  bio: z.string().optional(),
  social_profiles: z.record(z.string(), z.string()).optional(),
  is_verified: z.boolean().optional(),
  profile_completed: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});
