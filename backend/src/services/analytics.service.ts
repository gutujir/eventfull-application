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
      eventsBreakdown: [],
    };
  }

  // 2. Aggregate tickets sold and revenue across all events
  const validTicketsStats = await prisma.ticket.aggregate({
    where: {
      eventId: { in: eventIds },
      status: { not: "REFUNDED" },
    },
    _count: { id: true },
    _sum: { purchasePrice: true },
  });

  // 3. Get breakdown per event for charts
  const eventsWithStats = await prisma.event.findMany({
    where: { creatorId },
    select: {
      id: true,
      title: true,
      date: true,
    },
    take: 10,
    orderBy: { createdAt: "desc" },
  });

  const eventsBreakdown = await Promise.all(
    eventsWithStats.map(async (event) => {
      const stats = await prisma.ticket.aggregate({
        where: {
          eventId: event.id,
          status: { not: "REFUNDED" },
        },
        _count: { id: true },
        _sum: { purchasePrice: true },
      });

      return {
        id: event.id,
        title: event.title,
        date: event.date,
        ticketsSold: stats._count.id || 0, // ensure number
        revenue: Number(stats._sum.purchasePrice || 0), // ensure number
      };
    }),
  );

  return {
    totalEvents: events.length,
    totalTicketsSold: validTicketsStats._count.id || 0,
    totalRevenue: Number(validTicketsStats._sum.purchasePrice || 0),
    eventsBreakdown,
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
