import * as ticketDal from "../dal/ticket.dal";
import * as eventDal from "../dal/event.dal";
import { v4 as uuidv4 } from "uuid";

export const purchaseTicket = async (
  userId: string,
  eventId: string,
  ticketTypeId?: string,
) => {
  // 1. Check event exists
  const event = await eventDal.findEventById(eventId);
  if (!event) throw new Error("Event not found");

  // 2. Generate QR Code string
  const qrCode = `${eventId}-${userId}-${uuidv4()}`;

  // 3. Create Ticket
  // This is simplified. Normally payment check happens before this.
  const ticket = await ticketDal.createTicket({
    qrCode,
    purchasePrice: event.price, // Should look up ticketType price if exists
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
    // If paymentId exists, connect it
  });

  return ticket;
};

export const validateTicket = async (qrCode: string, eventId: string) => {
  const ticket = await ticketDal.findTicketByQrCode(qrCode);

  if (!ticket) throw new Error("Invalid ticket");
  if (ticket.eventId !== eventId)
    throw new Error("Ticket does not belong to this event");
  if (ticket.status !== "VALID") throw new Error(`Ticket is ${ticket.status}`);

  // Mark as used
  return await ticketDal.updateTicketStatus(ticket.id, "USED", new Date());
};
