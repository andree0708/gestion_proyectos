import prisma from '../config/db.js';

const generateInvoiceNumber = () => `INV-${Date.now().toString(36).toUpperCase()}`;

export const createInvoice = async (paymentId: string, amount: number) => {
  const existing = await prisma.invoice.findUnique({ where: { paymentId } });
  if (existing) return existing;

  const invoiceNumber = generateInvoiceNumber();
  return prisma.invoice.create({
    data: {
      paymentId,
      invoiceNumber,
      amount,
      pdfUrl: `/api/payments/invoices/${paymentId}/pdf`,
    },
  });
};

export const createPayment = async (orderId: string, amount: number) => {
  const existing = await prisma.payment.findUnique({ where: { orderId } });
  if (existing) return existing;

  return prisma.payment.create({
    data: { orderId, amount, status: 'pending', currency: 'COP' },
    include: { order: { include: { offer: true, buyer: true, seller: true } }, invoice: true },
  });
};

const PAYMENT_STATUS_FLOW: Record<string, string[]> = {
  pending: ['paid', 'failed', 'cancelled'],
  paid: [],
  failed: ['pending'],
  cancelled: [],
};

export const processPayment = async (paymentId: string, _paymentMethodId: string, orgId: string) => {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { order: true },
  });
  if (!payment) throw new Error('Pago no encontrado');

  if (!PAYMENT_STATUS_FLOW[payment.status]?.includes('paid') && !PAYMENT_STATUS_FLOW[payment.status]?.includes('failed')) {
    throw new Error(`El pago ya fue procesado (estado: ${payment.status})`);
  }

  if (payment.order.buyerOrgId !== orgId) {
    throw new Error('Solo el comprador puede procesar este pago');
  }

  const useStripe = process.env.STRIPE_SECRET_KEY;
  let status: string;
  let stripeId: string;

  if (useStripe) {
    status = 'paid';
    stripeId = `pi_stripe_${Date.now()}`;
  } else {
    const simulatedSuccess = Math.random() > 0.1;
    status = simulatedSuccess ? 'paid' : 'failed';
    stripeId = `pi_simulated_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      stripePaymentIntentId: stripeId,
      ...(status === 'paid' && { escrowReleasedAt: new Date() }),
    },
    include: { order: true, invoice: true },
  });

  if (status === 'paid') {
    await createInvoice(paymentId, Number(payment.amount));
    await prisma.order.update({
      where: { id: payment.orderId },
      data: { status: 'paid' },
    });
  }

  return updated;
};

export const getInvoiceByPayment = async (paymentId: string) => {
  return prisma.invoice.findUnique({
    where: { paymentId },
    include: {
      payment: {
        include: {
          order: {
            include: {
              offer: { include: { listing: { select: { title: true } } } },
              buyer: { select: { name: true } },
              seller: { select: { name: true } },
            },
          },
        },
      },
    },
  });
};

export const getInvoicePdfData = async (paymentId: string) => {
  const invoice = await getInvoiceByPayment(paymentId);
  if (!invoice) throw new Error('Factura no encontrada');
  return invoice;
};

export const confirmPayment = async (paymentId: string) => {
  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'paid', escrowReleasedAt: new Date() },
  });
  await createInvoice(paymentId, Number(payment.amount));
  return payment;
};

export const getPaymentByOrder = async (orderId: string) => {
  return prisma.payment.findUnique({
    where: { orderId },
    include: { invoice: true },
  });
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
      invoice: true,
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
