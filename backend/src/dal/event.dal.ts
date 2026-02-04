import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createEvent = async (data: Prisma.EventCreateInput) => {
  return await prisma.event.create({
    data,
    include: {
      ticketTypes: true,
      creator: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

export const findEvents = async (where: Prisma.EventWhereInput = {}) => {
  return await prisma.event.findMany({
    where,
    include: {
      ticketTypes: true,
      creator: {
        select: {
          first_name: true,
          last_name: true,
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
};

export const findEventById = async (id: string) => {
  return await prisma.event.findUnique({
    where: { id },
    include: {
      ticketTypes: true,
      creator: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

export const findEventBySlug = async (slug: string) => {
  return await prisma.event.findUnique({
    where: { slug },
    include: {
      ticketTypes: true,
      creator: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

export const findEventsByCreator = async (creatorId: string) => {
  return await prisma.event.findMany({
    where: { creatorId },
    include: {
      ticketTypes: true,
      _count: {
        select: {
          tickets: true, // Count of tickets sold
        },
      },
    },
    orderBy: {
      date: "asc",
    },
  });
};

export const updateEvent = async (
  id: string,
  data: Prisma.EventUpdateInput,
) => {
  return await prisma.event.update({
    where: { id },
    data,
    include: {
      ticketTypes: true,
      creator: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
  });
};

export const findEventAttendees = async (eventId: string) => {
  return await prisma.ticket.findMany({
    where: { eventId },
    include: {
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
    orderBy: {
      purchasedAt: "desc",
    },
  });
};
