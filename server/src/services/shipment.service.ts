import prisma from '../config/db.js';

export const createShipment = async (orderId: string, carrierOrgId: string, data: {
  estimatedDelivery?: Date;
  pickupAddress?: string;
  deliveryAddress?: string;
}) => {
  return prisma.shipment.create({
    data: {
      orderId,
      carrierOrgId,
      estimatedDelivery: data.estimatedDelivery,
      status: 'pending_pickup',
    },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      carrier: true,
      events: { orderBy: { timestamp: 'desc' } },
    },
  });
};

export const updateShipmentStatus = async (shipmentId: string, status: string, location?: string) => {
  const [shipment] = await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipmentId },
      data: { status },
    }),
    prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status,
        location,
      },
    }),
  ]);

  if (status === 'delivered') {
    await prisma.order.update({
      where: { id: shipment.orderId },
      data: { status: 'delivered' },
    });
  }

  return shipment;
};

export const getShipmentByOrder = async (orderId: string) => {
  return prisma.shipment.findUnique({
    where: { orderId },
    include: {
      carrier: true,
      events: { orderBy: { timestamp: 'desc' } },
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
    },
  });
};

export const getMyShipments = async (orgId: string) => {
  return prisma.shipment.findMany({
    where: {
      OR: [
        { order: { sellerOrgId: orgId } },
        { order: { buyerOrgId: orgId } },
        { carrierOrgId: orgId },
      ],
    },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      carrier: true,
      events: { orderBy: { timestamp: 'desc' }, take: 3 },
    },
    orderBy: { createdAt: 'desc' },
  });
};