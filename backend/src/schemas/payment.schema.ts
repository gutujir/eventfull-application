import { z } from "zod";

export const initializePaymentSchema = z.object({
  eventId: z.string().uuid(),
  ticketTypeId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
  email: z.string().email().optional(), // Optional if user is authenticated
  callbackUrl: z.string().url().optional(),
});
