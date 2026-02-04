import { prisma } from "../lib/prisma";

export const getCreatorStats = async (creatorId: string) => {
  // 1. Get all events by this creator
  const events = await prisma.event.findMany({
    where: { creatorId },
    select: { id: true },
  });

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    return {
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      events: [],
    };
  }

  // 2. Aggregate tickets sold and revenue across all events
  const ticketAggregates = await prisma.ticket.aggregate({
    where: {
      eventId: { in: eventIds },
      status: { not: "REFUNDED" },
    },

    _count: {
      id: true,
    },
    _sum: {
      purchasePrice: true,
    },
  });

  // Filter for valid tickets (VALID or USED) for revenue calculation if needed,
  // but usually we count all non-refunded.
  // The aggregate above includes all tickets that are not REFUNDED if we add the filter.
  // Let's refine the query.

  const validTicketsStats = await prisma.ticket.aggregate({
    where: {
      eventId: { in: eventIds },
      status: { not: "REFUNDED" },
    },
    _count: { id: true },
    _sum: { purchasePrice: true },
  });

  return {
    totalEvents: events.length,
    totalTicketsSold: validTicketsStats._count.id || 0,
    totalRevenue: validTicketsStats._sum.purchasePrice || 0,
  };
};

export const getEventStats = async (eventId: string) => {
  const [ticketStats, attendeeStats] = await Promise.all([
    // Total tickets sold and revenue
    prisma.ticket.aggregate({
      where: {
        eventId,
        status: { not: "REFUNDED" },
      },
      _count: { id: true },
      _sum: { purchasePrice: true },
    }),
    // Total checked-in attendees
    prisma.ticket.count({
      where: {
        eventId,
        status: "USED", // Or check scannedAt != null
        scannedAt: { not: null },
      },
    }),
  ]);

  return {
    ticketsSold: ticketStats._count.id || 0,
    revenue: ticketStats._sum.purchasePrice || 0,
    attendeesCheckedIn: attendeeStats,
  };
};
