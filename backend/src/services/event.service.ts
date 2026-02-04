import * as eventDal from "../dal/event.dal";
import { Prisma, EventStatus } from "../../generated/prisma";
import redis from "../lib/redis";

const CACHE_TTL = 300; // Cache for 5 minutes (300 seconds)
const EVENTS_CACHE_KEY = "public_events_feed";

export const createEvent = async (data: Prisma.EventCreateInput) => {
  // Clear cache when new event is created so feed updates immediately
  await redis.del(EVENTS_CACHE_KEY);

  // Add any business logic here (e.g. valid date check vs current time)
  return await eventDal.createEvent(data);
};

export const updateEventStatus = async (
  eventId: string,
  creatorId: string,
  status: EventStatus,
) => {
  const event = await eventDal.findEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }

  if (event.creatorId !== creatorId) {
    throw new Error("Unauthorized - you are not the creator of this event");
  }

  const updatedEvent = await eventDal.updateEvent(eventId, { status });

  // Clear cache if status changes (e.g. Published <-> Draft)
  await redis.del(EVENTS_CACHE_KEY);
  // Also clear individual event cache if we implement it later
  await redis.del(`event:${eventId}`);

  return updatedEvent;
};

export const getEvents = async () => {
  // 1. Try to fetch from Redis Cache first
  const cachedEvents = await redis.get(EVENTS_CACHE_KEY);

  if (cachedEvents) {
    console.log("Returning events from Cache 🚀");
    return JSON.parse(cachedEvents);
  }

  // 2. If not in cache, fetch from DB
  console.log("Fetching events from DB 🐢");
  const events = await eventDal.findEvents({
    isPublic: true,
    status: "PUBLISHED",
  });

  // 3. Save to Redis for next time
  if (events) {
    await redis.set(EVENTS_CACHE_KEY, JSON.stringify(events), "EX", CACHE_TTL);
  }

  return events;
};

export const getEventById = async (id: string) => {
  const cacheKey = `event:${id}`;

  // Try Cache
  const cachedEvent = await redis.get(cacheKey);
  if (cachedEvent) {
    return JSON.parse(cachedEvent);
  }

  // Fetch DB
  const event = await eventDal.findEventById(id);
  if (!event) {
    throw new Error("Event not found");
  }

  // Set Cache (Short TTL since details might change mostly for inventory/capacity)
  await redis.set(cacheKey, JSON.stringify(event), "EX", 60);

  return event;
};

export const getEventBySlug = async (slug: string) => {
  const cacheKey = `event_slug:${slug}`;

  // Try Cache
  const cachedEvent = await redis.get(cacheKey);
  if (cachedEvent) {
    return JSON.parse(cachedEvent);
  }

  const event = await eventDal.findEventBySlug(slug);
  if (!event) {
    throw new Error("Event not found");
  }

  // Set Cache
  await redis.set(cacheKey, JSON.stringify(event), "EX", 60);

  return event;
};

export const getEventsByCreator = async (creatorId: string) => {
  return await eventDal.findEventsByCreator(creatorId);
};

export const getEventAttendees = async (eventId: string, creatorId: string) => {
  // First verify the event belongs to this creator
  const event = await eventDal.findEventById(eventId);
  if (!event) {
    throw new Error("Event not found");
  }
  if (event.creatorId !== creatorId) {
    throw new Error("Unauthorized - you are not the creator of this event");
  }

  return await eventDal.findEventAttendees(eventId);
};
