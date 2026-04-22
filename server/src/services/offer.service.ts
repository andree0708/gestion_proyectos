import prisma from '../config/db.js';

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
      listing: { include: { category: true } },
      order: true,
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

  const totalAmount = offer.quantity * Number(offer.unitPrice);
  const platformFee = totalAmount * 0.03;
  const netAmount = totalAmount - platformFee;

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
  ]);

  await prisma.offer.updateMany({
    where: {
      listingId: offer.listingId,
      id: { not: id },
      status: 'pending',
    },
    data: { status: 'rejected' },
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