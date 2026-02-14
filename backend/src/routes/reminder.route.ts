import { Router } from "express";
import * as reminderController from "../controllers/reminder.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { rateLimitReminderCreate } from "../middlewares/sensitiveRateLimiter";

const router = Router();

router.post(
  "/",
  verifyToken,
  rateLimitReminderCreate,
  reminderController.createReminder,
);
router.get("/", verifyToken, reminderController.getReminders);

export default router;
