const CreateEventSchema = {
  type: "object",
  properties: {
    title: { type: "string", example: "Awesome Concert" },
    description: { type: "string", example: "Live concert with bands" },
    location: { type: "string", example: "Lagos" },
    date: {
      type: "string",
      format: "date-time",
      example: "2026-03-01T18:00:00Z",
    },
    price: { type: "number", example: 2000 },
    currency: { type: "string", example: "NGN" },
    capacity: { type: "integer", example: 500 },
    isPublic: { type: "boolean", example: true },
  },
  required: ["title", "description", "location", "date"],
};

const EventResponse = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    description: { type: "string" },
    location: { type: "string" },
    date: { type: "string", format: "date-time" },
    price: { type: "number" },
    currency: { type: "string" },
    capacity: { type: "integer" },
    slug: { type: "string" },
    status: { type: "string" },
  },
};

export { CreateEventSchema, EventResponse };
