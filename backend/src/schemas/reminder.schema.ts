import { z } from "zod";

export const createReminderSchema = z.object({
  eventId: z.string().uuid(),
  scheduledAt: z.string().datetime(),
});
