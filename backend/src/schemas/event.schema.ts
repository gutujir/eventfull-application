import { z } from "zod";

export const createEventSchema = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  date: z.string().datetime(), // Expects ISO string
  price: z.number().nonnegative().default(0),
  currency: z.string().default("NGN"),
  capacity: z.number().int().positive().optional(),
  isPublic: z.boolean().default(true),
  status: z
    .enum(["DRAFT", "PUBLISHED", "COMPLETED", "CANCELLED"])
    .default("DRAFT")
    .optional(),
  ticketTypes: z
    .array(
      z.object({
        name: z.string(),
        price: z.number().nonnegative(),
        capacity: z.number().int().positive().optional(),
        description: z.string().optional(),
      }),
    )
    .optional(),
});

export const updateEventSchema = createEventSchema.partial();
