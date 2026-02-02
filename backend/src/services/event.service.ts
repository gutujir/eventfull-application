import * as eventDal from "../dal/event.dal";
import { Prisma } from "../../generated/prisma";

export const createEvent = async (data: Prisma.EventCreateInput) => {
  // Add any business logic here (e.g. valid date check vs current time)
  return await eventDal.createEvent(data);
};

export const getEvents = async () => {
  // Add filtering logic here if needed
  return await eventDal.findEvents({
    isPublic: true,
    status: "PUBLISHED",
  });
};

export const getEventById = async (id: string) => {
  const event = await eventDal.findEventById(id);
  if (!event) {
    throw new Error("Event not found");
  }
  return event;
};
