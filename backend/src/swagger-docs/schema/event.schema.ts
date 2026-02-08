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
    reminderOffsetMinutes: { type: "integer", example: 1440 },
    ticketTypes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string", example: "VIP" },
          price: { type: "number", example: 5000 },
          currency: { type: "string", example: "NGN" },
        },
      },
    },
  },
  required: ["title", "description", "location", "date"],
};

const UpdateEventSchema = {
  type: "object",
  properties: {
    title: { type: "string" },
    description: { type: "string" },
    location: { type: "string" },
    date: { type: "string", format: "date-time" },
    price: { type: "number" },
    currency: { type: "string" },
    capacity: { type: "integer" },
    isPublic: { type: "boolean" },
    reminderOffsetMinutes: { type: "integer" },
  },
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
    isPublic: { type: "boolean" },
    imageUrl: { type: "string" },
    reminderOffsetMinutes: { type: "integer" },
    creator: {
      type: "object",
      properties: {
        id: { type: "string" },
        first_name: { type: "string" },
        last_name: { type: "string" },
        avatarUrl: { type: "string" },
        jobTitle: { type: "string" },
        company: { type: "string" },
        phone: { type: "string" },
        website: { type: "string" },
        bio: { type: "string" },
      },
    },
    ticketTypes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          price: { type: "number" },
          currency: { type: "string" },
        },
      },
    },
  },
};

export { CreateEventSchema, UpdateEventSchema, EventResponse };
