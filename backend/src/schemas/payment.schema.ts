import { z } from "zod";

export const initializePaymentSchema = z.object({
  amount: z.number().positive(),
  eventId: z.string().uuid(),
  email: z.email().optional(), // Optional if user is authenticated
  metadata: z.record(z.string(), z.any()).optional(),
});
