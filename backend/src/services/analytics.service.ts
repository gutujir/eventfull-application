import { prisma } from "../lib/prisma";
import redis from "../lib/redis";

const CREATOR_ANALYTICS_TTL_SECONDS = 60;
const EVENT_ANALYTICS_TTL_SECONDS = 60;

export const getCreatorStats = async (creatorId: string) => {
  const cacheKey = `analytics:creator:${creatorId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 1. Get all events by this creator
  const events = await prisma.event.findMany({
    where: { creatorId },
    select: { id: true },
  });

  const eventIds = events.map((e) => e.id);

  if (eventIds.length === 0) {
    const emptyStats = {
      totalEvents: 0,
      totalTicketsSold: 0,
      totalRevenue: 0,
      totalAttendeesCheckedIn: 0,
      totalUniqueEventeesBought: 0,
      eventsBreakdown: [],
    };

    await redis.set(
      cacheKey,
      JSON.stringify(emptyStats),
      "EX",
      CREATOR_ANALYTICS_TTL_SECONDS,
    );
    return emptyStats;
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

  const [totalAttendeesCheckedIn, uniqueBuyers] = await Promise.all([
    prisma.ticket.count({
      where: {
        eventId: { in: eventIds },
        status: "USED",
        scannedAt: { not: null },
      },
    }),
    prisma.ticket.findMany({
      where: {
        eventId: { in: eventIds },
        status: { not: "REFUNDED" },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

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

  const payload = {
    totalEvents: events.length,
    totalTicketsSold: validTicketsStats._count.id || 0,
    totalRevenue: Number(validTicketsStats._sum.purchasePrice || 0),
    totalAttendeesCheckedIn: Number(totalAttendeesCheckedIn || 0),
    totalUniqueEventeesBought: Number(uniqueBuyers.length || 0),
    eventsBreakdown,
  };

  await redis.set(
    cacheKey,
    JSON.stringify(payload),
    "EX",
    CREATOR_ANALYTICS_TTL_SECONDS,
  );

  return payload;
};

export const getEventStats = async (eventId: string) => {
  const cacheKey = `analytics:event:${eventId}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  const [ticketStats, attendeeStats, uniqueBuyers] = await Promise.all([
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
    prisma.ticket.findMany({
      where: {
        eventId,
        status: { not: "REFUNDED" },
      },
      distinct: ["userId"],
      select: { userId: true },
    }),
  ]);

  const ticketsSold = Number(ticketStats._count.id || 0);
  const attendeesCheckedIn = Number(attendeeStats || 0);
  const attendanceRate =
    ticketsSold > 0
      ? Number(((attendeesCheckedIn / ticketsSold) * 100).toFixed(2))
      : 0;

  const payload = {
    ticketsSold,
    revenue: Number(ticketStats._sum.purchasePrice || 0),
    attendeesCheckedIn,
    uniqueEventeesBought: Number(uniqueBuyers.length || 0),
    attendanceRate,
  };

  await redis.set(
    cacheKey,
    JSON.stringify(payload),
    "EX",
    EVENT_ANALYTICS_TTL_SECONDS,
  );

  return payload;
};
