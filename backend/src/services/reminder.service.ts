import * as reminderDal from "../dal/reminder.dal";

export const createReminder = async (
  userId: string,
  eventId: string,
  scheduledAt: Date,
) => {
  return await reminderDal.createReminder({
    scheduledAt,
    type: "USER_CUSTOM",
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
  });
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
