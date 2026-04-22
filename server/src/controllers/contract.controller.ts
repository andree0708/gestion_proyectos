import { Request, Response } from 'express';
import * as contractService from '../services/contract.service.js';
import { AuthRequest } from '../types/auth.types.js';

export const createContract = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.body;
    const result = await contractService.createContract(orderId);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const signContract = async (req: AuthRequest, res: Response) => {
  try {
    const { contractId } = req.params;
    const signerId = req.user!.userId;
    const signerOrgId = req.user!.orgId;
    const result = await contractService.signContract(contractId, signerId, signerOrgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getContract = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await contractService.getContract(id);
    if (!result) {
      return res.status(404).json({ error: 'Contrato no encontrado' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const confirmDelivery = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const buyerOrgId = req.user!.orgId;
    const result = await contractService.confirmDelivery(orderId, buyerOrgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};