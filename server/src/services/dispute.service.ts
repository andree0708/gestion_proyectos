import prisma from '../config/db.js';

export const createDispute = async (orderId: string, openedByOrgId: string, data: {
  reason: string;
  description: string;
}) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Orden no encontrada');
  if (order.sellerOrgId !== openedByOrgId && order.buyerOrgId !== openedByOrgId) {
    throw new Error('No tienes permiso para abrir disputa en esta orden');
  }

  return prisma.dispute.create({
    data: {
      orderId,
      openedByOrgId,
      reason: data.reason,
      description: data.description,
      status: 'open',
    },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      evidences: { orderBy: { createdAt: 'desc' } },
    },
  });
};

export const addEvidence = async (disputeId: string, uploadedByOrgId: string, data: {
  type: string;
  description?: string;
  fileUrl?: string;
}) => {
  return prisma.disputeEvidence.create({
    data: {
      disputeId,
      uploadedByOrgId,
      type: data.type,
      description: data.description,
      fileUrl: data.fileUrl,
    },
  });
};

export const resolveDispute = async (disputeId: string, adminOrgId: string, resolution: string) => {
  const dispute = await prisma.dispute.findUnique({ where: { id: disputeId } });
  if (!dispute) throw new Error('Disputa no encontrada');
  if (dispute.status !== 'open') throw new Error('La disputa ya fue resuelta');

  return prisma.dispute.update({
    where: { id: disputeId },
    data: {
      status: 'resolved',
      resolution,
      resolvedAt: new Date(),
    },
    include: { order: true },
  });
};

export const getDisputeById = async (disputeId: string) => {
  return prisma.dispute.findUnique({
    where: { id: disputeId },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      evidences: { orderBy: { createdAt: 'desc' } },
    },
  });
};

export const getMyDisputes = async (orgId: string) => {
  return prisma.dispute.findMany({
    where: {
      OR: [
        { order: { sellerOrgId: orgId } },
        { order: { buyerOrgId: orgId } },
      ],
    },
    include: {
      order: { include: { offer: { include: { listing: true } } } },
      evidences: { take: 2 },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getAllDisputes = async () => {
  return prisma.dispute.findMany({
    where: { status: 'open' },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      evidences: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};