import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createTicket = async (data: Prisma.TicketCreateInput) => {
  return await prisma.ticket.create({
    data,
  });
};

export const countTicketsByPaymentId = async (paymentId: string) => {
  return await prisma.ticket.count({
    where: { paymentId },
  });
};

export const findTicketByQrCode = async (qrCode: string) => {
  return await prisma.ticket.findFirst({
    where: {
      OR: [
        { qrCode: qrCode },
        { id: qrCode },
        { id: { startsWith: qrCode } }, // Support short Booking Ref
      ],
    },
    include: {
      event: true,
      user: true,
    },
  });
};

export const updateTicketStatus = async (
  id: string,
  status: any,
  scannedAt?: Date,
) => {
  return await prisma.ticket.update({
    where: { id },
    data: {
      status,
      scannedAt,
    },
  });
};

export const findTicketsByUser = async (userId: string) => {
  return await prisma.ticket.findMany({
    where: { userId },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          description: true,
          location: true,
          date: true,
          imageUrl: true,
          slug: true,
        },
      },
      ticketType: true,
    },
    orderBy: {
      purchasedAt: "desc",
    },
  });
};

export const findTicketById = async (id: string) => {
  return await prisma.ticket.findUnique({
    where: { id },
    include: {
      event: true,
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
      ticketType: true,
    },
  });
};
