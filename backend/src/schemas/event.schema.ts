import { z } from "zod";

const eventSchemaBase = z.object({
  title: z.string().min(3),
  description: z.string().min(10),
  location: z.string().min(3),
  date: z.string().datetime(), // Expects ISO string
  startDateTime: z.string().datetime().optional(),
  endDateTime: z.string().datetime().optional(),
  price: z.number().nonnegative().default(0),
  currency: z.string().default("NGN"),
  capacity: z.number().int().positive().optional(),
  reminderOffsetMinutes: z.number().int().positive().optional(),
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

const validateEndAfterStart = (
  data: {
    date?: string;
    startDateTime?: string;
    endDateTime?: string;
  },
  ctx: z.RefinementCtx,
) => {
  if (!data.endDateTime) return;

  const startAnchor = data.startDateTime || data.date;
  if (!startAnchor) return;

  const start = Date.parse(startAnchor);
  const end = Date.parse(data.endDateTime);

  if (!Number.isNaN(start) && !Number.isNaN(end) && end <= start) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "endDateTime must be later than date",
      path: ["endDateTime"],
    });
  }
};

export const createEventSchema = eventSchemaBase.superRefine(
  validateEndAfterStart,
);

export const updateEventSchema = eventSchemaBase
  .partial()
  .superRefine(validateEndAfterStart);
