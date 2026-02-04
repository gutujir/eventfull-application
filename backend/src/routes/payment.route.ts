import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { requireCreator } from "../middlewares/checkRole";

const router = Router();

router.post("/initialize", verifyToken, paymentController.initializePayment);
router.get("/verify", verifyToken, paymentController.verifyPayment);
router.post("/webhook", paymentController.verifyPaymentWebhook);

// Creator & User routes (role logic handled in controller)
router.get("/my/payments", verifyToken, paymentController.getMyPayments);

export default router;
