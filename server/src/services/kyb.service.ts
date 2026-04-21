import prisma from '../config/db.js';

export const submitKyb = async (orgId: string, docs: any) => {
  return prisma.organization.update({
    where: { id: orgId },
    data: {
      kybDocs: docs,
      kybStatus: 'pending',
    },
  });
};

export const getPendingKyb = async () => {
  return prisma.organization.findMany({
    where: { kybStatus: 'pending' },
    select: {
      id: true,
      name: true,
      taxId: true,
      country: true,
      sector: true,
      kybDocs: true,
      createdAt: true,
    },
  });
};

export const approveKyb = async (orgId: string) => {
  return prisma.organization.update({
    where: { id: orgId },
    data: { kybStatus: 'approved' },
  });
};

export const rejectKyb = async (orgId: string, reason: string) => {
  return prisma.organization.update({
    where: { id: orgId },
    data: { 
      kybStatus: 'rejected',
    },
  });
};