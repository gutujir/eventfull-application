import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createReminder = async (data: Prisma.ReminderCreateInput) => {
  return await prisma.reminder.create({
    data,
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
