const CreateReminderSchema = {
  type: "object",
  properties: {
    eventId: { type: "string", example: "uuid-event-id" },
    scheduledAt: {
      type: "string",
      format: "date-time",
      example: "2026-03-01T17:00:00Z",
    },
  },
  required: ["eventId", "scheduledAt"],
};

const ReminderResponse = {
  type: "object",
  properties: {
    id: { type: "string" },
    scheduledAt: { type: "string", format: "date-time" },
    isSent: { type: "boolean" },
  },
};

export { CreateReminderSchema, ReminderResponse };
