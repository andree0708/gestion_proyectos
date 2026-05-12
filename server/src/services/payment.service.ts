import prisma from '../config/db.js';

export const createPayment = async (orderId: string, amount: number) => {
  return prisma.payment.create({
    data: {
      orderId,
      amount,
      status: 'pending',
      currency: 'COP',
    },
    include: { order: { include: { offer: true, buyer: true, seller: true } } },
  });
};

export const processPayment = async (paymentId: string, paymentMethodId: string) => {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) throw new Error('Pago no encontrado');
  if (payment.status !== 'pending') throw new Error('El pago ya fue procesado');

  const simulatedSuccess = Math.random() > 0.1;

  const status = simulatedSuccess ? 'paid' : 'failed';
  const stripeId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  return prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      stripePaymentIntentId: stripeId,
      ...(simulatedSuccess && { escrowReleasedAt: new Date() }),
    },
    include: { order: true },
  });
};

export const confirmPayment = async (paymentId: string) => {
  return prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'paid', escrowReleasedAt: new Date() },
  });
};

export const getPaymentByOrder = async (orderId: string) => {
  return prisma.payment.findUnique({ where: { orderId } });
};

export const getMyPayments = async (orgId: string) => {
  return prisma.payment.findMany({
    where: {
      OR: [
        { order: { sellerOrgId: orgId } },
        { order: { buyerOrgId: orgId } },
      ],
    },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createBankAccount = async (orgId: string, data: {
  bankName: string;
  accountType: string;
  accountNumber: string;
  accountHolder: string;
}) => {
  return prisma.bankAccount.upsert({
    where: { orgId },
    update: data,
    create: { orgId, ...data, verified: false },
  });
};

export const getBankAccount = async (orgId: string) => {
  return prisma.bankAccount.findUnique({ where: { orgId } });
};