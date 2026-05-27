import { Response } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as reviewService from '../services/review.service.js';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    const { orderId } = req.params;
    const review = await reviewService.createReview(orderId, req.user!.orgId, req.body);
    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getOrgReviews = async (req: AuthRequest, res: Response) => {
  try {
    const orgId = req.params.orgId || req.user!.orgId;
    const [reviews, summary] = await Promise.all([
      reviewService.getReviewsForOrg(orgId),
      reviewService.getOrgRatingSummary(orgId),
    ]);
    res.json({ reviews, summary });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
