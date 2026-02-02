import { z } from "zod";

export const purchaseTicketSchema = z.object({
  eventId: z.string().uuid(),
  ticketTypeId: z.string().uuid().optional(),
  quantity: z.number().int().positive().default(1),
});

export const validateTicketSchema = z.object({
  qrCode: z.string(),
  eventId: z.string().uuid(),
});
