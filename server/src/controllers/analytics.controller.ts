import { Response } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as analyticsService from '../services/analytics.service.js';

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await analyticsService.getBusinessStats(req.user!.orgId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportCsv = async (req: AuthRequest, res: Response) => {
  try {
    const csv = await analyticsService.exportOrdersCsv(req.user!.orgId);
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=ordenes-subpro.csv');
    res.send(csv);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const exportPdf = async (req: AuthRequest, res: Response) => {
  try {
    const html = await analyticsService.exportOrdersPdfHtml(req.user!.orgId);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=reporte-subpro.html');
    res.send(html);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
