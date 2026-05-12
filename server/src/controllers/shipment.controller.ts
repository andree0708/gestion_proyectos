import { Request, Response } from 'express';
import * as shipmentService from '../services/shipment.service.js';

export const createShipment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const { carrierOrgId, estimatedDelivery } = req.body;
    const shipment = await shipmentService.createShipment(orderId, carrierOrgId, { estimatedDelivery });
    res.status(201).json(shipment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateStatus = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, location } = req.body;
    const shipment = await shipmentService.updateShipmentStatus(id, status, location);
    res.json(shipment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getByOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const shipment = await shipmentService.getShipmentByOrder(orderId);
    if (!shipment) return res.status(404).json({ error: 'Envío no encontrado' });
    res.json(shipment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyShipments = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.orgId;
    const shipments = await shipmentService.getMyShipments(orgId);
    res.json(shipments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};