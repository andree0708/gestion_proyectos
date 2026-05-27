import prisma from '../config/db.js';
import crypto from 'crypto';
import { canDeliverTo } from '../utils/logistics.js';

export interface CreateOfferDto {
  listingId: string;
  buyerOrgId: string;
  quantity: number;
  unitPrice: number;
  message?: string;
}

export const createOffer = async (data: CreateOfferDto) => {
  const listing = await prisma.listing.findUnique({
    where: { id: data.listingId },
    include: { organization: true },
  });

  if (!listing || listing.status !== 'active') {
    throw new Error('Listing no disponible');
  }

  if (listing.orgId === data.buyerOrgId) {
    throw new Error('No puedes ofrecer a tu propio listado');
  }

  if (Number(listing.quantity) < data.quantity) {
    throw new Error('Stock insuficiente para esta cantidad');
  }

  const buyer = await prisma.organization.findUnique({
    where: { id: data.buyerOrgId },
    select: { department: true },
  });

  const deliveryCheck = canDeliverTo(listing, buyer?.department);
  if (!deliveryCheck.ok) {
    throw new Error(deliveryCheck.reason || 'Entrega no viable a tu departamento');
  }

  return prisma.offer.create({
    data: {
      listingId: data.listingId,
      buyerOrgId: data.buyerOrgId,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      message: data.message,
      status: 'pending',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    include: {
      listing: { include: { category: true } },
      buyer: { select: { id: true, name: true, country: true } },
    },
  });
};

export const getOffersForListing = async (listingId: string, orgId: string) => {
  return prisma.offer.findMany({
    where: { listingId, listing: { orgId } },
    include: {
      buyer: { select: { id: true, name: true, country: true, kybStatus: true } },
      parent: { select: { id: true, unitPrice: true, quantity: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOffersForBuyer = async (buyerOrgId: string) => {
  return prisma.offer.findMany({
    where: { buyerOrgId },
    include: {
      listing: { include: { category: true, organization: { select: { name: true, country: true } } } },
      order: true,
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOffersForSeller = async (sellerOrgId: string) => {
  return prisma.offer.findMany({
    where: { listing: { orgId: sellerOrgId } },
    include: {
      listing: { include: { category: true } },
      buyer: { select: { id: true, name: true, country: true, kybStatus: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOfferById = async (id: string) => {
  return prisma.offer.findUnique({
    where: { id },
    include: {
      listing: { include: { organization: true, category: true } },
      buyer: { select: { id: true, name: true, country: true } },
      parent: true,
      children: true,
      order: true,
    },
  });
};

export const acceptOffer = async (id: string, orgId: string) => {
  const offer = await prisma.offer.findFirst({
    where: { id, listing: { orgId } },
    include: { listing: true },
  });

  if (!offer) {
    throw new Error('Oferta no encontrada');
  }

  if (offer.status !== 'pending') {
    throw new Error('La oferta ya no está disponible');
  }

  if (Number(offer.listing.quantity) < Number(offer.quantity)) {
    throw new Error('Stock insuficiente para aceptar esta oferta');
  }

  const totalAmount = offer.quantity * Number(offer.unitPrice);
  const platformFee = totalAmount * 0.03;
  const netAmount = totalAmount - platformFee;

  const newStock = Number(offer.listing.quantity) - Number(offer.quantity);

  const [updatedOffer, order] = await prisma.$transaction([
    prisma.offer.update({
      where: { id },
      data: { status: 'accepted' },
    }),
    prisma.order.create({
      data: {
        offerId: id,
        sellerOrgId: orgId,
        buyerOrgId: offer.buyerOrgId,
        status: 'confirmed',
        totalAmount,
        platformFee,
        netAmount,
      },
    }),
    prisma.listing.update({
      where: { id: offer.listingId },
      data: {
        quantity: newStock,
        ...(newStock <= 0 && { status: 'active' }),
      },
    }),
  ]);

  await prisma.offer.updateMany({
    where: {
      listingId: offer.listingId,
      id: { not: id },
      status: 'pending',
    },
    data: { status: 'rejected' },
  });

  const contentHash = crypto.createHash('sha256')
    .update(JSON.stringify({ orderId: order.id, totalAmount, platformFee, netAmount }))
    .digest('hex');

  await prisma.contract.create({
    data: { orderId: order.id, contentHash, status: 'pending_signature' },
  });

  await prisma.payment.create({
    data: { orderId: order.id, amount: totalAmount, status: 'pending', currency: 'COP' },
  });

  await prisma.conversation.create({ data: { orderId: order.id } });

  await prisma.shipment.create({
    data: {
      orderId: order.id,
      carrierOrgId: orgId,
      status: 'pending_pickup',
      deliveryTerms: 'Entrega en 7 días hábiles tras confirmación de pago',
    },
  });

  return { offer: updatedOffer, order };
};

export const rejectOffer = async (id: string, orgId: string) => {
  const offer = await prisma.offer.findFirst({
    where: { id, listing: { orgId } },
  });

  if (!offer) {
    throw new Error('Oferta no encontrada');
  }

  return prisma.offer.update({
    where: { id },
    data: { status: 'rejected' },
  });
};

export const counterOffer = async (id: string, data: { quantity?: number; unitPrice?: number; message?: string }) => {
  const parentOffer = await prisma.offer.findUnique({
    where: { id },
    include: { children: true },
  });

  if (!parentOffer) {
    throw new Error('Oferta no encontrada');
  }

  if (parentOffer.children && parentOffer.children.length >= 10) {
    throw new Error('Máximo de contraofertas alcanzado');
  }

  if (parentOffer.status !== 'pending') {
    throw new Error('La oferta ya no está disponible');
  }

  return prisma.offer.create({
    data: {
      listingId: parentOffer.listingId,
      buyerOrgId: parentOffer.buyerOrgId,
      quantity: data.quantity || Number(parentOffer.quantity),
      unitPrice: data.unitPrice || Number(parentOffer.unitPrice),
      message: data.message,
      parentOfferId: id,
      status: 'countered',
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
    include: {
      listing: { include: { category: true } },
      buyer: { select: { id: true, name: true } },
    },
  });
};