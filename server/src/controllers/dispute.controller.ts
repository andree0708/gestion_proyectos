import { Request, Response } from 'express';
import * as disputeService from '../services/dispute.service.js';

export const createDispute = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const orgId = (req as any).user.orgId;
    const { reason, description } = req.body;
    const dispute = await disputeService.createDispute(orderId, orgId, { reason, description });
    res.status(201).json(dispute);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const addEvidence = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).user.orgId;
    const { type, description, fileUrl } = req.body;
    const evidence = await disputeService.addEvidence(id, orgId, { type, description, fileUrl });
    res.status(201).json(evidence);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const resolveDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const adminOrgId = (req as any).user.orgId;
    const { resolution } = req.body;
    const dispute = await disputeService.resolveDispute(id, adminOrgId, resolution);
    res.json(dispute);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyDisputes = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.orgId;
    const disputes = await disputeService.getMyDisputes(orgId);
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllDisputes = async (req: Request, res: Response) => {
  try {
    const status = req.query.status as string | undefined;
    const disputes = await disputeService.getAllDisputes(status);
    res.json(disputes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getDispute = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dispute = await disputeService.getDisputeById(id);
    if (!dispute) return res.status(404).json({ error: 'Disputa no encontrada' });
    res.json(dispute);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};