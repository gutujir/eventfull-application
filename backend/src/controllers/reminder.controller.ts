import { Request, Response } from "express";
import * as reminderService from "../services/reminder.service";
import { createReminderSchema } from "../schemas/reminder.schema";

export const createReminder = async (req: Request, res: Response) => {
  try {
    const { eventId, scheduledAt } = createReminderSchema.parse(req.body);
    const userId = (req as any).user?.userId;

    const reminder = await reminderService.createReminder(
      userId,
      eventId,
      new Date(scheduledAt),
    );
    res.status(201).json({ success: true, reminder });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getReminders = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const reminders = await reminderService.getRemindersByUser(userId);
    res.status(200).json({ success: true, reminders });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
