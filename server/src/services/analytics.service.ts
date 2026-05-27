import prisma from '../config/db.js';

export const getBusinessStats = async (orgId: string) => {
  const [orders, payments, listings, disputes, reviews] = await Promise.all([
    prisma.order.findMany({
      where: { OR: [{ sellerOrgId: orgId }, { buyerOrgId: orgId }] },
      select: { id: true, status: true, totalAmount: true, sellerOrgId: true },
    }),
    prisma.payment.findMany({
      where: { OR: [{ order: { sellerOrgId: orgId } }, { order: { buyerOrgId: orgId } }] },
      select: { amount: true, status: true },
    }),
    prisma.listing.count({ where: { orgId } }),
    prisma.dispute.count({
      where: { OR: [{ order: { sellerOrgId: orgId } }, { order: { buyerOrgId: orgId } }] },
    }),
    prisma.review.findMany({ where: { reviewedOrgId: orgId }, select: { rating: true } }),
  ]);

  const totalRevenue = payments
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + Number(p.amount), 0);

  const pendingPayments = payments
    .filter(p => p.status === 'pending')
    .reduce((s, p) => s + Number(p.amount), 0);

  const avgRating = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  return {
    totalOrders: orders.length,
    activeOrders: orders.filter(o => ['confirmed', 'in_transit'].includes(o.status)).length,
    deliveredOrders: orders.filter(o => o.status === 'delivered').length,
    totalRevenue,
    pendingPayments,
    totalListings: listings,
    openDisputes: disputes,
    averageRating: Math.round(avgRating * 10) / 10,
    reviewCount: reviews.length,
  };
};

export const exportOrdersCsv = async (orgId: string) => {
  const orders = await prisma.order.findMany({
    where: { OR: [{ sellerOrgId: orgId }, { buyerOrgId: orgId }] },
    include: { offer: { include: { listing: true } } },
    orderBy: { createdAt: 'desc' },
  });

  const header = 'ID,Producto,Estado,Total,Comisión,Neto,Fecha\n';
  const rows = orders.map(o =>
    `${o.id},"${o.offer.listing.title}",${o.status},${o.totalAmount},${o.platformFee},${o.netAmount},${o.createdAt.toISOString()}`
  ).join('\n');

  return header + rows;
};

export const exportOrdersPdfHtml = async (orgId: string) => {
  const orders = await prisma.order.findMany({
    where: { OR: [{ sellerOrgId: orgId }, { buyerOrgId: orgId }] },
    include: { offer: { include: { listing: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const rows = orders.map(o => `
    <tr>
      <td>${o.offer.listing.title}</td>
      <td>${o.status}</td>
      <td>$${Number(o.totalAmount).toLocaleString('es-CO')}</td>
      <td>${new Date(o.createdAt).toLocaleDateString('es-CO')}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Reporte SubPro</title>
    <style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}
    th,td{border:1px solid #ddd;padding:8px}th{background:#059669;color:white}</style></head>
    <body><h1>Reporte de Órdenes - SubPro Exchange</h1>
    <p>Generado: ${new Date().toLocaleString('es-CO')}</p>
    <table><thead><tr><th>Producto</th><th>Estado</th><th>Total</th><th>Fecha</th></tr></thead>
    <tbody>${rows}</tbody></table></body></html>`;
};
