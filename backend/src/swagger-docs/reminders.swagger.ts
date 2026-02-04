import {
  CreateReminderSchema,
  ReminderResponse,
} from "./schema/reminder.schema";
import { ErrorResponse } from "./responses/auth.response";

export const remindersSwagger = {
  "/api/v1/reminders": {
    post: {
      tags: ["Reminders"],
      summary: "Create a reminder for an event",
      requestBody: {
        required: true,
        content: { "application/json": { schema: CreateReminderSchema } },
      },
      responses: {
        201: {
          description: "Reminder created",
          content: { "application/json": { schema: ReminderResponse } },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
    get: {
      tags: ["Reminders"],
      summary: "Get reminders for current user",
      responses: {
        200: {
          description: "List of reminders",
          content: {
            "application/json": {
              schema: { type: "array", items: ReminderResponse },
            },
          },
        },
      },
    },
  },
};
