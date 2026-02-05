import { Worker } from "bullmq";
import IORedis from "ioredis";
import * as reminderDal from "../dal/reminder.dal";
import { sendEmail } from "../services/email.service";
import { REDIS_URL, redisOptions } from "../lib/redis";

// Ensure BullMQ compatible redis options
const connection = new IORedis(REDIS_URL, redisOptions);

const worker = new Worker(
  "reminders",
  async (job: any) => {
    const { reminderId, userEmail, eventTitle, scheduledAt } = job.data as {
      reminderId: string;
      userEmail: string;
      eventTitle: string;
      scheduledAt: string;
    };

    console.log(
      `Processing reminder for ${userEmail} regarding event: ${eventTitle}`,
    );

    try {
      await sendEmail(
        userEmail,
        `Reminder: ${eventTitle} is coming up!`,
        `<h1>Event Reminder</h1>
         <p>Hi there,</p>
         <p>This is a reminder that <strong>${eventTitle}</strong> is scheduled for ${new Date(
           scheduledAt,
         ).toLocaleString()}.</p>
         <p>Don't miss it!</p>
         <br/>
         <p>The Eventfull Team</p>`,
      );

      // Mark reminder as sent in DB
      await reminderDal.markReminderAsSent(reminderId);
      console.log(`Reminder ${reminderId} sent successfully.`);
    } catch (error) {
      console.error(`Failed to send reminder ${reminderId}:`, error);
      throw error; // Let BullMQ retry
    }

    return { ok: true };
  },
  { connection },
);

worker.on("completed", (job) => {
  console.info("Reminder job completed", job.id);
});

worker.on("failed", (job, err) => {
  console.error("Reminder job failed", job?.id, err);
});

export default worker;
