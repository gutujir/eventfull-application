import * as paymentDal from "../dal/payment.dal";
import { v4 as uuidv4 } from "uuid";

export const initializePayment = async (
  userId: string,
  eventId: string,
  amount: number,
) => {
  // 1. Generate unique reference
  const reference = `REF-${uuidv4()}`;

  // 2. Create pending payment record
  const payment = await paymentDal.createPayment({
    amount,
    reference,
    status: "PENDING",
    user: { connect: { id: userId } },
    event: { connect: { id: eventId } },
  });

  // 3. Return payment details (could integrate Paystack initialization here)
  return {
    payment,
    authorizationUrl: "https://checkout.paystack.com/...", // Mock URL
  };
};

export const verifyPayment = async (reference: string) => {
  // 1. Verify with Provider (Paystack/Stripe)
  const isSuccess = true; // Mock result

  // 2. Update DB
  const status = isSuccess ? "SUCCESS" : "FAILED";
  const payment = await paymentDal.updatePaymentStatus(reference, status);

  return payment;
};
