import * as ticketDal from "../dal/ticket.dal";
import * as eventDal from "../dal/event.dal";
import * as reminderService from "./reminder.service";
import { v4 as uuidv4 } from "uuid";
import { generateQRCodeImage } from "./qrcode.service";
import { prisma } from "../lib/prisma";
import redis from "../lib/redis";

export const purchaseTicket = async (
  userId: string,
  eventId: string,
  ticketTypeId?: string,
) => {
  // 1. Check event exists
  const event = await eventDal.findEventById(eventId);
  if (!event) throw new Error("Event not found");

  const eventEnd = event.endDateTime
    ? new Date(event.endDateTime)
    : new Date(event.date);
  if (eventEnd <= new Date()) {
    throw new Error("This event has ended. Ticket booking is closed.");
  }

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
  await redis.del(`analytics:event:${eventId}`);
  await redis.del(`analytics:creator:${event.creatorId}`);

  return {
    ...ticket,
    qrCodeImage, // Include the base64 image data URL
  };
};

const validateTicketInternal = async (
  qrCode: string,
  eventId: string,
  creatorId?: string,
) => {
  const ticket = await ticketDal.findTicketByQrCode(qrCode);

  if (!ticket) throw new Error("Invalid ticket");
  if (ticket.eventId !== eventId)
    throw new Error("Ticket does not belong to this event");
  if (creatorId && ticket.event.creatorId !== creatorId) {
    throw new Error("Unauthorized - you are not the creator of this event");
  }
  if (ticket.status !== "VALID") throw new Error(`Ticket is ${ticket.status}`);

  // Mark as used
  const updatedTicket = await ticketDal.updateTicketStatus(
    ticket.id,
    "USED",
    new Date(),
  );

  await redis.del(`analytics:event:${eventId}`);
  await redis.del(`analytics:creator:${ticket.event.creatorId}`);

  return updatedTicket;
};

export const validateTicket = async (
  qrCode: string,
  eventId: string,
  creatorId?: string,
) => {
  return validateTicketInternal(qrCode, eventId, creatorId);
};

export const getTicketsByUser = async (userId: string) => {
  const tickets = await ticketDal.findTicketsByUser(userId);
  return Promise.all(
    tickets.map(async (ticket) => ({
      ...ticket,
      qrCodeImage: await generateQRCodeImage(ticket.qrCode),
    })),
  );
};

export const getTicketById = async (
  ticketId: string,
  requester?: { userId?: string; role?: string },
) => {
  const ticket = await ticketDal.findTicketById(ticketId);
  if (!ticket) throw new Error("Ticket not found");

  if (requester?.role !== "ADMIN") {
    const isOwner = requester?.userId === ticket.userId;
    const isCreatorForEvent =
      (requester?.role === "CREATOR" || requester?.role === "ADMIN") &&
      requester?.userId === ticket.event.creatorId;

    if (!isOwner && !isCreatorForEvent) {
      throw new Error("Unauthorized - cannot view this ticket");
    }
  }

  // Generate QR code image for this ticket
  const qrCodeImage = await generateQRCodeImage(ticket.qrCode);

  return {
    ...ticket,
    qrCodeImage,
  };
};

export const createTicketsForPayment = async (params: {
  userId: string;
  eventId: string;
  ticketTypeId?: string;
  quantity: number;
  paymentId: string;
  purchasePrice: number;
  currency: string;
}) => {
  const {
    userId,
    eventId,
    ticketTypeId,
    quantity,
    paymentId,
    purchasePrice,
    currency,
  } = params;

  const event = await eventDal.findEventById(eventId);
  if (!event) throw new Error("Event not found");

  const eventEnd = event.endDateTime
    ? new Date(event.endDateTime)
    : new Date(event.date);
  if (eventEnd <= new Date()) {
    throw new Error("This event has ended. Ticket booking is closed.");
  }

  const tickets = [];
  for (let i = 0; i < quantity; i += 1) {
    const qrCodeToken = `${eventId}-${userId}-${uuidv4()}`;

    const ticket = await ticketDal.createTicket({
      qrCode: qrCodeToken,
      purchasePrice,
      currency,
      user: { connect: { id: userId } },
      event: { connect: { id: eventId } },
      payment: { connect: { id: paymentId } },
      ...(ticketTypeId && { ticketType: { connect: { id: ticketTypeId } } }),
    });
    tickets.push(ticket);
  }

  // Schedule default reminder once per purchase if creator set it
  if (event.reminderOffsetMinutes) {
    const eventDate = new Date(event.date);
    const reminderTime = new Date(
      eventDate.getTime() - event.reminderOffsetMinutes * 60000,
    );
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

  await redis.del(`analytics:event:${eventId}`);
  await redis.del(`analytics:creator:${event.creatorId}`);

  return tickets;
};
