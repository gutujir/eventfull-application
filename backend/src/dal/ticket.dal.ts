import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createTicket = async (data: Prisma.TicketCreateInput) => {
  return await prisma.ticket.create({
    data,
  });
};

export const findTicketByQrCode = async (qrCode: string) => {
  return await prisma.ticket.findUnique({
    where: { qrCode },
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
