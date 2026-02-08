import * as paymentDal from "../dal/payment.dal";
import * as ticketDal from "../dal/ticket.dal";
import * as ticketService from "./ticket.service";
import * as eventDal from "../dal/event.dal";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { paystackConfig } from "../config/paystack.config";

export const initializePayment = async (
  userId: string,
  eventId: string,
  ticketTypeId: string | undefined,
  quantity: number,
  email: string,
  callbackUrl?: string,
) => {
  if (!paystackConfig.secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

  const event = await eventDal.findEventById(eventId);
  if (!event) throw new Error("Event not found");

  let unitPrice = Number(event.price);
  let currency = event.currency || "NGN";

  if (ticketTypeId) {
    const ticketType = await eventDal.findTicketTypeById(ticketTypeId);
    if (!ticketType) throw new Error("Ticket type not found");
    if (ticketType.eventId !== eventId)
      throw new Error("Ticket type does not belong to this event");
    unitPrice = Number(ticketType.price);
    currency = ticketType.currency || currency;
  }

  const amount = Number(unitPrice) * quantity;
  if (amount <= 0) throw new Error("Payment amount must be greater than 0");

  // 1. Generate unique reference
  const reference = `REF-${uuidv4()}`;
  // Amount in kobo for Paystack
  const amountInKobo = Math.round(amount * 100);

  // 2. Initialize with Paystack
  let paystackResponse;
  try {
    const response = await axios.post(
      `${paystackConfig.baseUrl}/transaction/initialize`,
      {
        email,
        amount: amountInKobo,
        reference,
        metadata: {
          eventId,
          userId,
          ticketTypeId: ticketTypeId || null,
          quantity,
        },
        ...(callbackUrl ? { callback_url: callbackUrl } : {}),
        // callback_url: "http://localhost:3000/api/v1/payments/callback" // Optional: frontend should handle this
      },
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
          "Content-Type": "application/json",
        },
      },
    );
    paystackResponse = response.data;
  } catch (error: any) {
    console.error(
      "Paystack initialization error:",
      error.response?.data || error.message,
    );
    const errorMessage = error.response?.data?.message || error.message;
    throw new Error(`Payment initialization failed: ${errorMessage}`);
  }

  if (!paystackResponse.status) {
    throw new Error("Paystack returned invalid status");
  }

  // 3. Create pending payment record
  const payment = await paymentDal.createPayment({
    amount, // Store in base currency unit (e.g. Naira), not kobo
    currency,
    reference,
    status: "PENDING",
    metadata: {
      ticketTypeId: ticketTypeId || null,
      quantity,
    },
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
  });

  // 4. Return payment details
  return {
    payment,
    authorizationUrl: paystackResponse.data.authorization_url,
    accessCode: paystackResponse.data.access_code,
    reference,
  };
};

export const verifyPayment = async (reference: string) => {
  if (!paystackConfig.secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

  // 1. Verify with Paystack
  let validationData;
  try {
    const response = await axios.get(
      `${paystackConfig.baseUrl}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackConfig.secretKey}`,
        },
      },
    );
    validationData = response.data;
  } catch (error: any) {
    console.error(
      "Paystack verification error:",
      error.response?.data || error.message,
    );
    throw new Error("Payment verification failed");
  }

  // 2. Check status
  const isSuccess =
    validationData.status && validationData.data.status === "success";

  // 3. Update DB
  const status = isSuccess ? "SUCCESS" : "FAILED";

  // Only update if not already success (idempotency check basically)
  const existingPayment = await paymentDal.findPaymentByReference(reference);
  if (!existingPayment) throw new Error("Payment not found");

  const updateResult = await paymentDal.updatePaymentStatusIfNotSuccess(
    reference,
    status,
    {
      paidAt: isSuccess ? new Date(validationData.data.paid_at) : undefined,
      channel: validationData.data.channel || null,
    },
  );

  if (isSuccess && updateResult.count > 0) {
    const meta = (existingPayment.metadata || {}) as any;
    const quantity = Number(meta.quantity || 1);
    const ticketTypeId = meta.ticketTypeId || undefined;

    const tickets = await ticketService.createTicketsForPayment({
      userId: existingPayment.userId,
      eventId: existingPayment.eventId,
      ticketTypeId,
      quantity,
      paymentId: existingPayment.id,
      purchasePrice: Number(existingPayment.amount),
      currency: existingPayment.currency,
    });

    return { payment: existingPayment, tickets };
  }

  return { payment: existingPayment, tickets: [] };
};

export const getPaymentsForCreator = async (creatorId: string) => {
  return await paymentDal.findPaymentsByCreator(creatorId);
};

export const getPaymentsForUser = async (userId: string) => {
  return await paymentDal.findPaymentsByUser(userId);
};
