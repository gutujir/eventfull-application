import cron from "node-cron";
import { processReminders } from "../services/reminder.service";

export const initReminderJob = () => {
  // Run every minute
  cron.schedule("* * * * *", async () => {
    try {
      console.log("Running reminder job...");
      await processReminders();
    } catch (error) {
      console.error("Error running reminder job:", error);
    }
  });
};
