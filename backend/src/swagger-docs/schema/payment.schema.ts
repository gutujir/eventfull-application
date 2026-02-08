const InitializePaymentSchema = {
  type: "object",
  properties: {
    eventId: { type: "string" },
    ticketTypeId: { type: "string", nullable: true },
    quantity: { type: "integer", example: 1 },
    email: { type: "string", format: "email", example: "payer@example.com" },
    callbackUrl: {
      type: "string",
      example: "http://localhost:5173/payments/verify",
    },
  },
  required: ["eventId"],
};

const PaymentResponse = {
  type: "object",
  properties: {
    success: { type: "boolean", example: true },
    payment: { type: "object" },
    authorizationUrl: { type: "string" },
    accessCode: { type: "string" },
    reference: { type: "string" },
    tickets: { type: "array", items: { type: "object" } },
  },
};

export { InitializePaymentSchema, PaymentResponse };
