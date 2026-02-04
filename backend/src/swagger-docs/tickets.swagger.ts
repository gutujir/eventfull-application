import { PurchaseTicketSchema, TicketResponse } from "./schema/ticket.schema";
import { ErrorResponse } from "./responses/auth.response";

export const ticketsSwagger = {
  "/api/v1/tickets/purchase": {
    post: {
      tags: ["Tickets"],
      summary: "Purchase tickets for an event",
      requestBody: {
        required: true,
        content: { "application/json": { schema: PurchaseTicketSchema } },
      },
      responses: {
        201: {
          description: "Ticket(s) created",
          content: { "application/json": { schema: TicketResponse } },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/tickets/validate": {
    post: {
      tags: ["Tickets"],
      summary: "Validate (scan) a ticket",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: {
              type: "object",
              properties: {
                qrCode: { type: "string" },
                eventId: { type: "string" },
              },
              required: ["qrCode", "eventId"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Ticket validated",
          content: { "application/json": { schema: TicketResponse } },
        },
        400: {
          description: "Invalid ticket",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/tickets/my-tickets": {
    get: {
      tags: ["Tickets"],
      summary: "Get tickets for current user",
      responses: {
        200: {
          description: "List of tickets",
          content: {
            "application/json": {
              schema: { type: "array", items: TicketResponse },
            },
          },
        },
      },
    },
  },

  "/api/v1/tickets/{id}": {
    get: {
      tags: ["Tickets"],
      summary: "Get ticket by id",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Ticket",
          content: { "application/json": { schema: TicketResponse } },
        },
        404: {
          description: "Not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
