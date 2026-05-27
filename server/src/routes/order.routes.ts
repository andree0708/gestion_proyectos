import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import prisma from '../config/db.js';

const router = Router();

router.get('/my', authenticate, async (req, res) => {
  try {
    const orgId = (req as any).user.orgId;
    const orders = await prisma.order.findMany({
      where: {
        OR: [{ sellerOrgId: orgId }, { buyerOrgId: orgId }],
      },
      include: {
        offer: { include: { listing: true, buyer: { select: { id: true, name: true } } } },
        contract: { include: { signatures: true } },
        payment: { include: { invoice: true } },
        shipment: { include: { events: { orderBy: { timestamp: 'desc' }, take: 5 } } },
        dispute: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params;
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        offer: { include: { listing: true } },
        contract: true,
        payment: true,
      },
    });
    if (!order) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(order);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;