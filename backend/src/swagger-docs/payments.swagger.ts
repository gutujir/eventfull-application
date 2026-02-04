import {
  InitializePaymentSchema,
  PaymentResponse,
} from "./schema/payment.schema";
import { ErrorResponse } from "./responses/auth.response";

export const paymentsSwagger = {
  "/api/v1/payments/initialize": {
    post: {
      tags: ["Payments"],
      summary: "Initialize a payment (returns authorization URL)",
      requestBody: {
        required: true,
        content: { "application/json": { schema: InitializePaymentSchema } },
      },
      responses: {
        200: {
          description: "Payment initialized",
          content: { "application/json": { schema: PaymentResponse } },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/payments/webhook": {
    post: {
      tags: ["Payments"],
      summary: "Payment provider webhook endpoint",
      requestBody: {
        required: true,
        content: { "application/json": { schema: { type: "object" } } },
      },
      responses: { 200: { description: "Webhook received" } },
    },
  },
  "/api/v1/payments/verify": {
    get: {
      tags: ["Payments"],
      summary: "Verify a payment transaction",
      parameters: [
        {
          name: "reference",
          in: "query",
          required: true,
          schema: { type: "string" },
          description: "Payment reference to verify",
        },
      ],
      responses: {
        200: {
          description: "Payment verified successfully",
          content: { "application/json": { schema: PaymentResponse } },
        },
        400: {
          description: "Verification failed or invalid reference",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/payments/my/payments": {
    get: {
      tags: ["Payments"],
      summary:
        "Get payment history (Context-aware: Creator sees earnings, User sees purchases)",
      responses: {
        200: {
          description: "List of payments",
          content: {
            "application/json": {
              schema: { type: "array", items: PaymentResponse },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
