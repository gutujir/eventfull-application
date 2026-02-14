import { Router } from "express";
import * as paymentController from "../controllers/payment.controller";
import { verifyToken } from "../middlewares/verifyToken";
import {
  rateLimitPaymentInitialize,
  rateLimitPaymentVerify,
  rateLimitPaymentWebhook,
} from "../middlewares/sensitiveRateLimiter";

const router = Router();

router.post(
  "/initialize",
  verifyToken,
  rateLimitPaymentInitialize,
  paymentController.initializePayment,
);
router.get(
  "/verify",
  verifyToken,
  rateLimitPaymentVerify,
  paymentController.verifyPayment,
);
router.post(
  "/webhook",
  rateLimitPaymentWebhook,
  paymentController.verifyPaymentWebhook,
);

// Creator & User routes (role logic handled in controller)
router.get("/my/payments", verifyToken, paymentController.getMyPayments);

export default router;
