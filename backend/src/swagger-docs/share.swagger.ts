import { ErrorResponse } from "./responses/auth.response";

export const shareSwagger = {
  "/api/v1/share/events/{slug}/metadata": {
    get: {
      tags: ["Share"],
      summary: "Get share metadata for an event by slug",
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
          description: "Event metadata",
          content: { "application/json": { schema: { type: "object" } } },
        },
        404: {
          description: "Not found",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/share/events/{id}/link": {
    get: {
      tags: ["Share"],
      summary: "Get a shareable link for an event",
      parameters: [
        { name: "id", in: "path", required: true, schema: { type: "string" } },
      ],
      responses: {
        200: {
          description: "Shareable link",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { url: { type: "string" } },
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
};
