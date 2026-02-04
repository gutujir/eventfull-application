import dotenv from "dotenv";

dotenv.config();

export const paystackConfig = {
  secretKey: process.env.PAYSTACK_SECRET_KEY,
  baseUrl: "https://api.paystack.co",
};

if (!paystackConfig.secretKey) {
  console.warn("PAYSTACK_SECRET_KEY is not defined in environment variables.");
}
