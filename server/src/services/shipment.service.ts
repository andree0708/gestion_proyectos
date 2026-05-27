import prisma from '../config/db.js';

const VALID_TRANSITIONS: Record<string, string[]> = {
  pending_pickup: ['picked_up', 'cancelled'],
  picked_up: ['in_transit', 'returned'],
  in_transit: ['out_for_delivery', 'delayed', 'returned'],
  out_for_delivery: ['delivered', 'failed_delivery'],
  delivered: ['confirmed_by_buyer'],
  confirmed_by_buyer: [],
  delayed: ['in_transit', 'returned'],
  failed_delivery: ['out_for_delivery', 'returned'],
  returned: [],
  cancelled: [],
};

const STATUS_LABELS: Record<string, string> = {
  pending_pickup: 'Pendiente de recogida',
  picked_up: 'Recogido',
  in_transit: 'En tránsito',
  out_for_delivery: 'En reparto',
  delivered: 'Entregado',
  confirmed_by_buyer: 'Confirmado por comprador',
  delayed: 'Retrasado',
  failed_delivery: 'Entrega fallida',
  returned: 'Devuelto',
  cancelled: 'Cancelado',
};

export const isValidTransition = (current: string, next: string): boolean => {
  return VALID_TRANSITIONS[current]?.includes(next) ?? false;
};

export const calculateShippingCost = (weightKg: number, volumeM3: number, distanceKm = 100) => {
  const baseRate = 50000;
  const weightCost = weightKg * 1200;
  const volumeCost = volumeM3 * 80000;
  const distanceCost = distanceKm * 350;
  const total = baseRate + weightCost + volumeCost + distanceCost;
  const tax = Math.round(total * 0.19);
  return {
    baseRate,
    weightCost,
    volumeCost,
    distanceCost,
    tax,
    total: Math.round(total + tax),
    currency: 'COP',
    estimatedDays: Math.max(2, Math.ceil(distanceKm / 200)),
    breakdown: { baseRate, weightCost, volumeCost, distanceCost, tax },
  };
};

const generateTrackingCode = () => {
  const prefix = 'SPX';
  const ts = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${prefix}${ts}${rand}`;
};

export const createShipment = async (orderId: string, carrierOrgId: string, data: {
  estimatedDelivery?: Date;
  pickupAddress?: string;
  deliveryAddress?: string;
  weightKg?: number;
  volumeM3?: number;
  deliveryTerms?: string;
  shippingCost?: number;
}) => {
  const trackingCode = generateTrackingCode();

  const shipment = await prisma.shipment.create({
    data: {
      orderId,
      carrierOrgId,
      estimatedDelivery: data.estimatedDelivery || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      pickupAddress: data.pickupAddress,
      deliveryAddress: data.deliveryAddress,
      weightKg: data.weightKg,
      volumeM3: data.volumeM3,
      deliveryTerms: data.deliveryTerms || 'Estándar — 7 días hábiles',
      shippingCost: data.shippingCost,
      trackingCode,
      status: 'pending_pickup',
    },
  });

  await prisma.shipmentEvent.create({
    data: { shipmentId: shipment.id, status: 'pending_pickup', location: 'En espera de recogida' },
  });

  return prisma.shipment.findUnique({
    where: { id: shipment.id },
    include: {
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
      carrier: true,
      events: { orderBy: { timestamp: 'desc' } },
    },
  });
};

export const updateShipment = async (shipmentId: string, data: {
  weightKg?: number;
  volumeM3?: number;
  pickupAddress?: string;
  deliveryAddress?: string;
  deliveryTerms?: string;
  shippingCost?: number;
  estimatedDelivery?: Date;
}) => {
  return prisma.shipment.update({
    where: { id: shipmentId },
    data,
    include: {
      carrier: true,
      events: { orderBy: { timestamp: 'desc' } },
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true } },
    },
  });
};

export const updateShipmentStatus = async (shipmentId: string, status: string, location?: string) => {
  const shipment = await prisma.shipment.findUnique({ where: { id: shipmentId } });
  if (!shipment) throw new Error('Envío no encontrado');

  if (!isValidTransition(shipment.status, status)) {
    throw new Error(
      `Transición inválida: de "${STATUS_LABELS[shipment.status] || shipment.status}" a "${STATUS_LABELS[status] || status}"`
    );
  }

  const [updated] = await prisma.$transaction([
    prisma.shipment.update({
      where: { id: shipmentId },
      data: {
        status,
        estimatedDelivery: status === 'picked_up'
          ? new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
          : shipment.estimatedDelivery,
      },
    }),
    prisma.shipmentEvent.create({
      data: {
        shipmentId,
        status,
        location: location || undefined,
      },
    }),
  ]);

  const orderStatusMap: Record<string, string> = {
    picked_up: 'shipped',
    in_transit: 'in_transit',
    delivered: 'delivered',
    confirmed_by_buyer: 'completed',
    cancelled: 'cancelled',
  };

  const orderStatus = orderStatusMap[status];
  if (orderStatus) {
    await prisma.order.update({ where: { id: shipment.orderId }, data: { status: orderStatus } });
  }

  return updated;
};

export const getShipmentByOrder = async (orderId: string) => {
  return prisma.shipment.findUnique({
    where: { orderId },
    include: {
      carrier: true,
      events: { orderBy: { timestamp: 'desc' } },
      order: { include: { offer: { include: { listing: true } }, buyer: true, seller: true, contract: true } },
    },
  });
};

export const getShipmentByTrackingCode = async (trackingCode: string) => {
  return prisma.shipment.findFirst({
    where: { trackingCode },
    include: {
      order: { include: { offer: { include: { listing: { select: { title: true } } } } } },
      events: { orderBy: { timestamp: 'desc' } },
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
      events: { orderBy: { timestamp: 'desc' }, take: 5 },
    },
    orderBy: { createdAt: 'desc' },
  });
};
