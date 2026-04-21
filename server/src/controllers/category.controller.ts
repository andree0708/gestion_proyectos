import { Request, Response } from 'express';
import * as categoryService from '../services/category.service.js';

export const getAllCategories = async (_req: Request, res: Response) => {
  try {
    const result = await categoryService.getAllCategories();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await categoryService.getCategoryById(id);
    if (!result) {
      return res.status(404).json({ error: 'Category not found' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const seedCategories = async (_req: Request, res: Response) => {
  try {
    await categoryService.seedCategories();
    res.json({ message: 'Categories seeded successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};