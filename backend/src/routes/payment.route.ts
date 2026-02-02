import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.post("/initialize", verifyToken, paymentController.initializePayment);
router.post("/webhook", paymentController.verifyPaymentWebhook); // Should verify signature

export default router;
