const PurchaseTicketSchema = {
  type: "object",
  properties: {
    eventId: { type: "string", example: "uuid-event-id" },
    ticketTypeId: { type: "string", example: "uuid-tickettype-id" },
    quantity: { type: "integer", example: 1 },
  },
  required: ["eventId"],
};

const TicketResponse = {
  type: "object",
  properties: {
    id: { type: "string" },
    qrCode: { type: "string" },
    status: { type: "string" },
    purchasePrice: { type: "number" },
    currency: { type: "string" },
  },
};

export { PurchaseTicketSchema, TicketResponse };
