import { Router } from "express";
import * as reminderController from "../controllers/reminder.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/", verifyToken, reminderController.createReminder);

export default router;
