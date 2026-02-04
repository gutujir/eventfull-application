import { ErrorResponse } from "./responses/auth.response";

export const analyticsSwagger = {
  "/api/v1/analytics/dashboard": {
    get: {
      tags: ["Analytics"],
      summary: "Get creator dashboard analytics",
      responses: {
        200: {
          description: "Dashboard data",
          content: { "application/json": { schema: { type: "object" } } },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/analytics/event/{eventId}": {
    get: {
      tags: ["Analytics"],
      summary: "Get analytics for a single event",
      parameters: [
        {
          name: "eventId",
          in: "path",
          required: true,
          schema: { type: "string" },
        },
      ],
      responses: {
        200: {
          description: "Event analytics",
          content: { "application/json": { schema: { type: "object" } } },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
