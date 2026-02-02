import { Request, Response } from "express";
import * as paymentService from "../services/payment.service";
import { initializePaymentSchema } from "../schemas/payment.schema";

export const initializePayment = async (req: Request, res: Response) => {
  try {
    const { amount, metadata } = initializePaymentSchema.parse(req.body);
    const userId = (req as any).user?.userId;
    // Assuming eventId comes from body or metadata, adjusting schema might be needed
    // For now, let's assume it's passed or handled
    const eventId = req.body.eventId;

    if (!eventId) throw new Error("Event ID required");

    const result = await paymentService.initializePayment(
      userId,
      eventId,
      amount,
    );
    res.status(200).json({ success: true, ...result });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const verifyPaymentWebhook = async (req: Request, res: Response) => {
  // Handle Webhook from Provider
  const reference = req.body.data?.reference;
  if (reference) {
    await paymentService.verifyPayment(reference);
  }
  res.sendStatus(200);
};
