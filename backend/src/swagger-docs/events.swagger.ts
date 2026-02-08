import {
  CreateEventSchema,
  UpdateEventSchema,
  EventResponse,
} from "./schema/event.schema";
import { ErrorResponse } from "./responses/auth.response";

export const eventsSwagger = {
  "/api/v1/events": {
    get: {
      tags: ["Events"],
      summary: "Get public events",
      parameters: [
        {
          name: "search",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Search by title/description",
        },
        {
          name: "location",
          in: "query",
          required: false,
          schema: { type: "string" },
          description: "Filter by location",
        },
      ],
      responses: {
        200: {
          description: "List of events",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  events: { type: "array", items: EventResponse },
                },
              },
            },
          },
        },
      },
    },
    post: {
      tags: ["Events"],
      summary: "Create an event (authenticated)",
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: CreateEventSchema },
          "multipart/form-data": {
            schema: {
              allOf: [
                CreateEventSchema,
                {
                  type: "object",
                  properties: {
                    image: { type: "string", format: "binary" },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        201: {
          description: "Event created",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/events/{id}": {
    get: {
      tags: ["Events"],
      summary: "Get event by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Event",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        404: {
          description: "Not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
    put: {
      tags: ["Events"],
      summary: "Update an event (creator only)",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": { schema: UpdateEventSchema },
          "multipart/form-data": {
            schema: {
              allOf: [
                UpdateEventSchema,
                {
                  type: "object",
                  properties: {
                    image: { type: "string", format: "binary" },
                  },
                },
              ],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Event updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
    delete: {
      tags: ["Events"],
      summary: "Delete an event (creator only)",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Event deleted",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        404: {
          description: "Not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/events/slug/{slug}": {
    get: {
      tags: ["Events"],
      summary: "Get event by slug",
      parameters: [
        {
          name: "slug",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Event",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        404: {
          description: "Not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/events/my/events": {
    get: {
      tags: ["Events"],
      summary: "Get events created by the authenticated creator",
      responses: {
        200: {
          description: "List of events",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  events: { type: "array", items: EventResponse },
                },
              },
            },
          },
        },
      },
    },
  },

  "/api/v1/events/{id}/attendees": {
    get: {
      tags: ["Events"],
      summary: "Get attendees for an event (creator only)",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "List of attendees",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  attendees: { type: "array", items: { type: "object" } },
                },
              },
            },
          },
        },
        403: {
          description: "Forbidden",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/events/{id}/status": {
    patch: {
      tags: ["Events"],
      summary: "Update event status",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                status: {
                  type: "string",
                  enum: ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"],
                },
              },
              required: ["status"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Event status updated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  event: EventResponse,
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
