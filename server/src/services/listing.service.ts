import prisma from '../config/db.js';

export interface CreateListingDto {
  orgId: string;
  categoryId: string;
  title: string;
  description?: string;
  quantity: number;
  unit: string;
  priceType: 'fixed' | 'negotiate';
  priceAmount?: number;
  locationLat?: number;
  locationLng?: number;
  attributes?: any;
  photos?: string[];
  technicalSheetUrl?: string;
  originDepartment?: string;
  originCity?: string;
  logisticsType?: string;
  shelfLifeDays?: number;
  deliveryModes?: string[];
  allowedDepartments?: string[];
}

export const createListing = async (data: CreateListingDto) => {
  return prisma.listing.create({
    data: {
      orgId: data.orgId,
      categoryId: data.categoryId,
      title: data.title,
      description: data.description,
      quantity: data.quantity,
      unit: data.unit,
      priceType: data.priceType,
      priceAmount: data.priceAmount,
      attributes: data.attributes,
      photos: data.photos || [],
      technicalSheetUrl: data.technicalSheetUrl,
      originDepartment: data.originDepartment,
      originCity: data.originCity,
      logisticsType: data.logisticsType || 'ambient',
      shelfLifeDays: data.shelfLifeDays,
      deliveryModes: data.deliveryModes || ['pickup'],
      allowedDepartments: data.allowedDepartments || [],
      status: 'draft',
    },
  });
};

export const getMyListings = async (orgId: string) => {
  return prisma.listing.findMany({
    where: { orgId },
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  });
};

export const getListingById = async (id: string) => {
  return prisma.listing.findUnique({
    where: { id },
    include: { 
      organization: { select: { id: true, name: true, kybStatus: true, department: true, city: true, country: true } },
      category: true 
    },
  });
};

export const publishListing = async (id: string, orgId: string) => {
  const listing = await prisma.listing.findFirst({
    where: { id, orgId },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  return prisma.listing.update({
    where: { id },
    data: { status: 'active' },
  });
};

export const getPendingListings = async () => {
  return prisma.listing.findMany({
    where: { status: 'pending_review' },
    include: { 
      organization: { select: { id: true, name: true, taxId: true } },
      category: true 
    },
    orderBy: { createdAt: 'asc' },
  });
};

export const approveListing = async (id: string) => {
  return prisma.listing.update({
    where: { id },
    data: { status: 'active' },
  });
};

export const rejectListing = async (id: string, reason: string) => {
  return prisma.listing.update({
    where: { id },
    data: { status: 'rejected' },
  });
};

export const updateListing = async (id: string, orgId: string, data: Partial<CreateListingDto>) => {
  const listing = await prisma.listing.findFirst({
    where: { id, orgId },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  return prisma.listing.update({
    where: { id },
    data: {
      ...data,
      status: listing.status === 'draft' ? 'draft' : 'pending_review',
    },
  });
};

export const deleteListing = async (id: string, orgId: string) => {
  const listing = await prisma.listing.findFirst({
    where: { id, orgId },
  });

  if (!listing) {
    throw new Error('Listing not found');
  }

  return prisma.listing.delete({
    where: { id },
  });
};