import { Request, Response } from 'express';
import * as kybService from '../services/kyb.service.js';
import { AuthRequest } from '../types/auth.types.js';

export const submitKyb = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.orgId;
    const docs = req.body.docs;
    const result = await kybService.submitKyb(orgId, docs);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPendingKyb = async (req: AuthRequest, res: Response) => {
  try {
    const result = await kybService.getPendingKyb();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveKyb = async (req: AuthRequest, res: Response) => {
  try {
    const { orgId } = req.params;
    const result = await kybService.approveKyb(orgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectKyb = async (req: AuthRequest, res: Response) => {
  try {
    const { orgId } = req.params;
    const { reason } = req.body;
    const result = await kybService.rejectKyb(orgId, reason);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};