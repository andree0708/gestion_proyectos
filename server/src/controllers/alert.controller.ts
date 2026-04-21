import { Request, Response } from 'express';
import * as alertService from '../services/alert.service.js';
import { AuthRequest } from '../types/auth.types.js';

export const createAlert = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const { categoryId, region } = req.body;
    const result = await alertService.createAlert(userId, { categoryId, region });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getUserAlerts = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.userId;
    const result = await alertService.getUserAlerts(userId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    await alertService.deleteAlert(id, userId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const toggleAlert = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.userId;
    const result = await alertService.toggleAlert(id, userId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};