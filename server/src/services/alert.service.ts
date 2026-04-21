import prisma from '../config/db.js';

export const createAlert = async (userId: string, data: { categoryId?: string; region?: string }) => {
  return prisma.alert.create({
    data: {
      userId,
      categoryId: data.categoryId || null,
      region: data.region || null,
      active: true,
    },
  });
};

export const getUserAlerts = async (userId: string) => {
  return prisma.alert.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });
};

export const deleteAlert = async (id: string, userId: string) => {
  return prisma.alert.deleteMany({
    where: { id, userId },
  });
};

export const toggleAlert = async (id: string, userId: string) => {
  const alert = await prisma.alert.findFirst({
    where: { id, userId },
  });

  if (!alert) {
    throw new Error('Alert not found');
  }

  return prisma.alert.update({
    where: { id },
    data: { active: !alert.active },
  });
};