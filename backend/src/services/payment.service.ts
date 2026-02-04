import * as paymentDal from "../dal/payment.dal";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { paystackConfig } from "../config/paystack.config";

export const initializePayment = async (
  userId: string,
  eventId: string,
  amount: number,
  email: string,
) => {
  if (!paystackConfig.secretKey) {
    throw new Error("Paystack secret key is not configured");
  }

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
        },
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
    reference,
    status: "PENDING",
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
  if (existingPayment && existingPayment.status !== "SUCCESS") {
    // NOTE: In a real app, you might also want to generate the Ticket here if payment matches ticket price
    // and hasn't been generated yet.
    return await paymentDal.updatePaymentStatus(reference, status);
  }

  return existingPayment;
};

export const getPaymentsForCreator = async (creatorId: string) => {
  return await paymentDal.findPaymentsByCreator(creatorId);
};

export const getPaymentsForUser = async (userId: string) => {
  return await paymentDal.findPaymentsByUser(userId);
};
