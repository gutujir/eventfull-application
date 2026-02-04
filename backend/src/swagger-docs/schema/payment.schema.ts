const InitializePaymentSchema = {
  type: "object",
  properties: {
    amount: { type: "number", example: 2000 },
    email: { type: "string", format: "email", example: "payer@example.com" },
    metadata: { type: "object" },
    eventId: { type: "string" },
  },
  required: ["amount", "email", "eventId"],
};

const PaymentResponse = {
  type: "object",
  properties: {
    payment: { type: "object" },
    authorizationUrl: { type: "string" },
  },
};

export { InitializePaymentSchema, PaymentResponse };
