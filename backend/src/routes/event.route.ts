import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

// Public routes
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);

// Protected routes
router.post("/", verifyToken, eventController.createEvent);

export default router;
