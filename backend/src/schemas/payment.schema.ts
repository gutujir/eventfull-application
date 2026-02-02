import { z } from "zod";

export const initializePaymentSchema = z.object({
  amount: z.number().positive(),
  email: z.email(),
  metadata: z.record(z.string(), z.any()).optional(),
});
