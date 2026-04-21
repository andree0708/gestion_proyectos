import { Request, Response } from 'express';
import * as catalogService from '../services/catalog.service.js';

export const searchListings = async (req: Request, res: Response) => {
  try {
    const query = {
      search: req.query.search as string,
      categoryId: req.query.categoryId as string,
      minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
      maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
      minQuantity: req.query.minQuantity ? parseFloat(req.query.minQuantity as string) : undefined,
      unit: req.query.unit as string,
      country: req.query.country as string,
      page: req.query.page ? parseInt(req.query.page as string) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
    };

    const result = await catalogService.searchListings(query);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getListingsMap = async (_req: Request, res: Response) => {
  try {
    const result = await catalogService.getListingsMap();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFeaturedCategories = async (_req: Request, res: Response) => {
  try {
    const result = await catalogService.getFeaturedCategories();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};