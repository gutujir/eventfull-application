import { Queue, JobScheduler } from "bullmq";
import IORedis from "ioredis";

const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
// Ensure BullMQ compatible redis options
const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

const QUEUE_NAME = "reminders";

// Scheduler is required for delayed jobs to be processed reliably
new JobScheduler(QUEUE_NAME, { connection });

const reminderQueue = new Queue(QUEUE_NAME, { connection });

export const addReminderJob = async (payload: {
  reminderId: string;
  scheduledAt: string;
  userEmail: string;
  eventTitle: string;
}) => {
  const delay = Math.max(
    0,
    new Date(payload.scheduledAt).getTime() - Date.now(),
  );

  return await reminderQueue.add(
    "send-reminder",
    {
      reminderId: payload.reminderId,
      userEmail: payload.userEmail,
      eventTitle: payload.eventTitle,
    },
    {
      delay,
      attempts: 3,
      removeOnComplete: true,
      removeOnFail: false,
    },
  );
};

export { reminderQueue };
