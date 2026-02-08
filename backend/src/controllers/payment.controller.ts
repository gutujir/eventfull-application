import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { initializePaymentSchema } from "../schemas/payment.schema";
import * as authDal from "../dal/auth.dal";

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { email, eventId, ticketTypeId, quantity, callbackUrl } =
      initializePaymentSchema.parse(req.body);
    const user = (req as any).user;
    const userId = user?.userId;

    // Prefer email from logged in user, fallback to body
    const payerEmail = user?.email || email;

    if (!userId) throw new Error("Unauthorized");

    if (!payerEmail) throw new Error("Email required");

    const result = await paymentService.initializePayment(
      userId,
      eventId,
      ticketTypeId,
      quantity,
      payerEmail,
      callbackUrl,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    console.error("Initialize payment error:", error);
    res.status(400).json({ success: false, error: error.message });
  }
};

export const verifyPaymentWebhook = async (req: Request, res: Response) => {
  // Handle Webhook from Provider
  // Validate Paystack signature here using process.env.PAYSTACK_SECRET_KEY
  // const hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
  // if (hash == req.headers['x-paystack-signature']) { ... }

  const reference = req.body.data?.reference;
  if (reference) {
    await paymentService.verifyPayment(reference);
  }
  res.sendStatus(200);
};

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const reference = req.query.reference as string;
    if (!reference) {
      res
        .status(400)
        .json({ success: false, error: "Payment reference required" });
      return;
    }

    const result = await paymentService.verifyPayment(reference);
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userId = user?.userId;
    let role = user?.role;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!role) {
      const dbUser = await authDal.findUserById(userId);
      role = dbUser?.role;
    }

    let payments;
    if (role === "CREATOR" || role === "ADMIN") {
      // Creators see payments MADE to them (for their events)
      payments = await paymentService.getPaymentsForCreator(userId);
    } else {
      // Regular users (EVENTEE) see payments MADE by them
      payments = await paymentService.getPaymentsForUser(userId);
    }

    res.status(200).json({ success: true, payments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
