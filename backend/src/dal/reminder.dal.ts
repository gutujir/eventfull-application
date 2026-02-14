import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createReminder = async (data: Prisma.ReminderCreateInput) => {
  return await prisma.reminder.create({
    data,
    include: {
      user: true,
      event: true,
    },
  });
};

export const findPendingReminders = async () => {
  return await prisma.reminder.findMany({
    where: {
      isSent: false,
      scheduledAt: {
        lte: new Date(),
      },
    },
    include: {
      user: true,
      event: true,
    },
  });
};

export const markReminderAsSent = async (id: string) => {
  return await prisma.reminder.update({
    where: { id },
    data: { isSent: true },
  });
};

export const findReminderById = async (id: string) => {
  return await prisma.reminder.findUnique({
    where: { id },
    include: { user: true, event: true },
  });
};

export const findRemindersByUser = async (userId: string) => {
  return await prisma.reminder.findMany({
    where: { userId },
    include: { event: true },
    orderBy: { scheduledAt: "asc" },
  });
};
