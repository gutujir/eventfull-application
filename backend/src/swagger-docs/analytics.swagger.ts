import { ErrorResponse } from "./responses/auth.response";

export const analyticsSwagger = {
  "/api/v1/analytics/dashboard": {
    get: {
      tags: ["Analytics"],
      summary: "Get creator dashboard analytics",
      responses: {
        200: {
          description: "Dashboard data",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  stats: {
                    type: "object",
                    properties: {
                      totalEvents: { type: "number", example: 5 },
                      totalTicketsSold: { type: "number", example: 320 },
                      totalRevenue: { type: "number", example: 1250000 },
                      totalAttendeesCheckedIn: { type: "number", example: 287 },
                      totalUniqueEventeesBought: {
                        type: "number",
                        example: 241,
                      },
                      eventsBreakdown: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            id: { type: "string" },
                            title: { type: "string" },
                            date: { type: "string", format: "date-time" },
                            ticketsSold: { type: "number" },
                            revenue: { type: "number" },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
        403: {
          description: "Forbidden (creator/admin only)",
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
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  stats: {
                    type: "object",
                    properties: {
                      ticketsSold: { type: "number", example: 120 },
                      revenue: { type: "number", example: 540000 },
                      attendeesCheckedIn: { type: "number", example: 94 },
                      uniqueEventeesBought: { type: "number", example: 89 },
                      attendanceRate: { type: "number", example: 78.33 },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
        403: {
          description: "Forbidden (creator/admin only)",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
