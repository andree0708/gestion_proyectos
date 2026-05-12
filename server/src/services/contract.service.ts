import prisma from '../config/db.js';
import crypto from 'crypto';

export const createContract = async (orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      offer: { include: { listing: true } },
    },
  });

  if (!order) {
    throw new Error('Orden no encontrada');
  }

  const contentHash = crypto.createHash('sha256')
    .update(JSON.stringify({
      orderId,
      totalAmount: order.totalAmount,
      platformFee: order.platformFee,
      netAmount: order.netAmount,
      timestamp: new Date().toISOString(),
    }))
    .digest('hex');

  const contract = await prisma.contract.create({
    data: {
      orderId,
      contentHash,
      status: 'pending_signature',
    },
  });

  return contract;
};

export const signContract = async (contractId: string, signerId: string, signerOrgId: string) => {
  const contract = await prisma.contract.findUnique({
    where: { id: contractId },
  });

  if (!contract) {
    throw new Error('Contrato no encontrado');
  }

  if (contract.status !== 'pending_signature') {
    throw new Error('El contrato ya fue firmado');
  }

  const signature = crypto.createHash('sha256')
    .update(`${contractId}${signerId}${Date.now()}`)
    .digest('hex');

  await prisma.contractSignature.create({
    data: {
      contractId,
      signerId,
      signerOrgId,
      signature,
    },
  });

  const signaturesCount = await prisma.contractSignature.count({
    where: { contractId },
  });

  if (signaturesCount >= 2) {
    return prisma.contract.update({
      where: { id: contractId },
      data: { status: 'signed' },
    });
  }

  return { contract, signaturesCount };
};

export const getContract = async (contractId: string) => {
  return prisma.contract.findUnique({
    where: { id: contractId },
  });
};

export const confirmDelivery = async (orderId: string, buyerOrgId: string) => {
  const order = await prisma.order.findFirst({
    where: { id: orderId, buyerOrgId, status: 'in_transit' },
  });

  if (!order) {
    throw new Error('Orden no encontrada o no está en tránsito');
  }

  return prisma.order.update({
    where: { id: orderId },
    data: { status: 'delivered' },
  });
};