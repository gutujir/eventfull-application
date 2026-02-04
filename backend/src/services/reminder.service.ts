import * as reminderDal from "../dal/reminder.dal";
import { addReminderJob } from "../queues/reminder.queue";

export const createReminder = async (
  userId: string,
  eventId: string,
  scheduledAt: Date,
  type: "USER_CUSTOM" | "CREATOR_DEFAULT" = "USER_CUSTOM",
) => {
  const created = await reminderDal.createReminder({
    scheduledAt,
    type,
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
  });

  // Enqueue a job to send the reminder at the scheduled time
  try {
    await addReminderJob({
      reminderId: created.id,
      scheduledAt: created.scheduledAt.toISOString(),
      userEmail: created.user.email,
      eventTitle: created.event.title,
    });
  } catch (err) {
    // Log and continue — the DB record exists and worker can recover later
    console.warn(
      "Failed to enqueue reminder job:",
      (err as Error).message || err,
    );
  }

  return created;
};

export const processReminders = async () => {
  // This function would be called by a cron job
  const pending = await reminderDal.findPendingReminders();

  for (const reminder of pending) {
    // Send Email/SMS logic here
    console.log(
      `Sending reminder to ${reminder.user.email} for event ${reminder.event.title}`,
    );

    await reminderDal.markReminderAsSent(reminder.id);
  }
};

export const getRemindersByUser = async (userId: string) => {
  return await reminderDal.findRemindersByUser(userId);
};
