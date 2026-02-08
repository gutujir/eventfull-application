import { prisma } from "../lib/prisma";
import { Prisma } from "../../generated/prisma";

export const createPayment = async (data: Prisma.PaymentCreateInput) => {
  return await prisma.payment.create({
    data,
  });
};

export const updatePaymentStatus = async (
  reference: string,
  status: any,
  data: Partial<{ paidAt: Date; channel: string | null }> = {},
) => {
  return await prisma.payment.update({
    where: { reference },
    data: { status, ...data },
  });
};

export const updatePaymentStatusIfNotSuccess = async (
  reference: string,
  status: any,
  data: Partial<{ paidAt: Date; channel: string | null }> = {},
) => {
  return await prisma.payment.updateMany({
    where: {
      reference,
      status: { not: "SUCCESS" },
    },
    data: { status, ...data },
  });
};

export const findPaymentByReference = async (reference: string) => {
  return await prisma.payment.findUnique({
    where: { reference },
    include: { tickets: true },
  });
};

export const findPaymentsByCreator = async (creatorId: string) => {
  return await prisma.payment.findMany({
    where: {
      event: {
        creatorId: creatorId,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
        },
      },
      user: {
        select: {
          id: true,
          first_name: true,
          last_name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const findPaymentsByUser = async (userId: string) => {
  return await prisma.payment.findMany({
    where: {
      userId,
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          date: true,
          location: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
