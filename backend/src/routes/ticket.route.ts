import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { requireCreator } from "../middlewares/checkRole";
import { rateLimitTicketValidate } from "../middlewares/sensitiveRateLimiter";

const router = Router();

// Protected routes - authenticated users
router.post("/purchase", verifyToken, ticketController.purchaseTicket);
router.get("/my-tickets", verifyToken, ticketController.getMyTickets);
router.get("/:id", verifyToken, ticketController.getTicketById);

// Creator-only route for validating tickets
router.post(
  "/validate",
  verifyToken,
  requireCreator,
  rateLimitTicketValidate,
  ticketController.validateTicket,
);

export default router;
