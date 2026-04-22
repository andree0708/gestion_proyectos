import { Request, Response } from 'express';
import * as offerService from '../services/offer.service.js';
import { AuthRequest } from '../types/auth.types.js';

export const createOffer = async (req: AuthRequest, res: Response) => {
  try {
    const buyerOrgId = req.user!.orgId;
    const result = await offerService.createOffer({ ...req.body, buyerOrgId });
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOffersForListing = async (req: AuthRequest, res: Response) => {
  try {
    const { listingId } = req.params;
    const orgId = req.user!.orgId;
    const result = await offerService.getOffersForListing(listingId, orgId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOffersForBuyer = async (req: AuthRequest, res: Response) => {
  try {
    const buyerOrgId = req.user!.orgId;
    const result = await offerService.getOffersForBuyer(buyerOrgId);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getOfferById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await offerService.getOfferById(id);
    if (!result) {
      return res.status(404).json({ error: 'Oferta no encontrada' });
    }
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const acceptOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    const result = await offerService.acceptOffer(id, orgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = req.user!.orgId;
    const result = await offerService.rejectOffer(id, orgId);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const counterOffer = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const result = await offerService.counterOffer(id, req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};