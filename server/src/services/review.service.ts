import prisma from '../config/db.js';

export const createReview = async (orderId: string, reviewerOrgId: string, data: {
  rating: number;
  comment?: string;
}) => {
  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error('Orden no encontrada');
  if (order.status !== 'delivered') throw new Error('Solo puedes calificar órdenes entregadas');

  const reviewedOrgId = order.sellerOrgId === reviewerOrgId ? order.buyerOrgId : order.sellerOrgId;
  if (order.sellerOrgId !== reviewerOrgId && order.buyerOrgId !== reviewerOrgId) {
    throw new Error('No tienes permiso para calificar esta orden');
  }

  if (data.rating < 1 || data.rating > 5) throw new Error('La calificación debe ser entre 1 y 5');

  return prisma.review.upsert({
    where: { orderId_reviewerOrgId: { orderId, reviewerOrgId } },
    update: { rating: data.rating, comment: data.comment },
    create: { orderId, reviewerOrgId, reviewedOrgId, rating: data.rating, comment: data.comment },
  });
};

export const getReviewsForOrg = async (orgId: string) => {
  return prisma.review.findMany({
    where: { reviewedOrgId: orgId },
    orderBy: { createdAt: 'desc' },
  });
};

export const getOrgRatingSummary = async (orgId: string) => {
  const reviews = await prisma.review.findMany({ where: { reviewedOrgId: orgId } });
  if (reviews.length === 0) return { average: 0, count: 0 };
  const average = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
  return { average: Math.round(average * 10) / 10, count: reviews.length };
};
