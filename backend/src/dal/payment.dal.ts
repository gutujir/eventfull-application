import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createPayment = async (data: Prisma.PaymentCreateInput) => {
  return await prisma.payment.create({
    data,
  });
};

export const updatePaymentStatus = async (reference: string, status: any) => {
  return await prisma.payment.update({
    where: { reference },
    data: { status },
  });
};

export const findPaymentByReference = async (reference: string) => {
  return await prisma.payment.findUnique({ where: { reference } });
};
