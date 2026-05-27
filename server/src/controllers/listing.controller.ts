import { Request, Response } from 'express';
import * as listingService from '../services/listing.service.js';
import { AuthRequest } from '../types/auth.types.js';
import { upload } from '../middleware/upload.middleware.js';

export const createListing = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.orgId;
    const result = await listingService.createListing({ ...req.body, orgId });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyListings = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.user!.orgId;
    const result = await listingService.getMyListings(orgId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getListingById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await listingService.getListingById(id);
    if (!result) {
      return res.status(404).json({ error: 'Listing not found' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const publishListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    const result = await listingService.publishListing(id, orgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getPendingListings = async (req: AuthRequest, res: Response) => {
  try {
    const result = await listingService.getPendingListings();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await listingService.approveListing(id);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;
    const result = await listingService.rejectListing(id, reason || 'Rejected by moderator');
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    const result = await listingService.updateListing(id, orgId, req.body);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteListing = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    await listingService.deleteListing(id, orgId);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const uploadPhotos = async (req: AuthRequest, res: Response) => {
  try {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      return res.status(400).json({ error: 'No se subió ninguna foto' });
    }
    const urls = files.map(f => `/uploads/${f.filename}`);
    res.json({ urls });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadTechnicalSheet = async (req: AuthRequest, res: Response) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ error: 'No se subió ningún archivo' });
    }
    res.json({ url: `/uploads/${file.filename}` });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};