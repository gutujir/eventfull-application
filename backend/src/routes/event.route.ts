import { Router } from "express";
import * as eventController from "../controllers/event.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { requireCreator } from "../middlewares/checkRole";

const router = Router();

// Public routes
router.get("/", eventController.getEvents);
router.get("/:id", eventController.getEventById);
router.get("/slug/:slug", eventController.getEventBySlug);

// Protected routes - creators only
router.post("/", verifyToken, requireCreator, eventController.createEvent);
router.get(
  "/my/events",
  verifyToken,
  requireCreator,
  eventController.getMyEvents,
);
router.get(
  "/:id/attendees",
  verifyToken,
  requireCreator,
  eventController.getEventAttendees,
);
router.patch(
  "/:id/status",
  verifyToken,
  requireCreator,
  eventController.updateEventStatus,
);

export default router;
