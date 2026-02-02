import { Router } from "express";
import * as ticketController from "../controllers/ticket.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/purchase", verifyToken, ticketController.purchaseTicket);
router.post("/validate", verifyToken, ticketController.validateTicket); // Usually restricted to Creator/Admin

export default router;
