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
    qrCodeImage: { type: "string" },
    scannedAt: { type: "string", format: "date-time" },
    event: {
      type: "object",
      properties: {
        id: { type: "string" },
        title: { type: "string" },
        description: { type: "string" },
        location: { type: "string" },
        date: { type: "string", format: "date-time" },
        imageUrl: { type: "string" },
        slug: { type: "string" },
      },
    },
    ticketType: {
      type: "object",
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        price: { type: "number" },
        currency: { type: "string" },
      },
    },
  },
};

export { PurchaseTicketSchema, TicketResponse };
