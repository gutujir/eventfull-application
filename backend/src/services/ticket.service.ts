import * as ticketDal from "../dal/ticket.dal";
import * as eventDal from "../dal/event.dal";
import * as reminderService from "./reminder.service";
import { v4 as uuidv4 } from "uuid";
import { generateQRCodeImage } from "./qrcode.service";
import { prisma } from "../lib/prisma";

export const purchaseTicket = async (
  userId: string,
  eventId: string,
  ticketTypeId?: string,
) => {
  // 1. Check event exists
  const event = await eventDal.findEventById(eventId);
  if (!event) throw new Error("Event not found");

  // 2. Determine the price based on ticketType or event price
  let purchasePrice = event.price;
  if (ticketTypeId) {
    const ticketType = await prisma.ticketType.findUnique({
      where: { id: ticketTypeId },
    });
    if (!ticketType) throw new Error("Ticket type not found");
    if (ticketType.eventId !== eventId)
      throw new Error("Ticket type does not belong to this event");
    purchasePrice = ticketType.price;
  }

  // 3. Generate QR Code token
  const qrCodeToken = `${eventId}-${userId}-${uuidv4()}`;

  // 4. Generate QR Code image
  const qrCodeImage = await generateQRCodeImage(qrCodeToken);

  // 5. Create Ticket
  const ticket = await ticketDal.createTicket({
    qrCode: qrCodeToken,
    purchasePrice,
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
    ...(ticketTypeId && { ticketType: { connect: { id: ticketTypeId } } }),
  });

  // 6. Schedule Default Reminder (if configured by Creator)
  if (event.reminderOffsetMinutes) {
    const eventDate = new Date(event.date);
    const reminderTime = new Date(
      eventDate.getTime() - event.reminderOffsetMinutes * 60000,
    );

    // Only schedule if the reminder time hasn't passed yet
    if (reminderTime > new Date()) {
      try {
        await reminderService.createReminder(
          userId,
          eventId,
          reminderTime,
          "CREATOR_DEFAULT",
        );
      } catch (err) {
        console.warn(
          "Failed to schedule default reminder:",
          (err as Error).message,
        );
      }
    }
  }

  // 7. Return ticket with QR code image
  return {
    ...ticket,
    qrCodeImage, // Include the base64 image data URL
  };
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

export const getTicketsByUser = async (userId: string) => {
  return await ticketDal.findTicketsByUser(userId);
};

export const getTicketById = async (ticketId: string) => {
  const ticket = await ticketDal.findTicketById(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  // Generate QR code image for this ticket
  const qrCodeImage = await generateQRCodeImage(ticket.qrCode);

  return {
    ...ticket,
    qrCodeImage,
  };
};
