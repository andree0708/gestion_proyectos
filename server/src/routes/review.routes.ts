import { Router } from 'express';
import * as reviewController from '../controllers/review.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders/:orderId', authenticate, reviewController.createReview);
router.get('/org/:orgId?', authenticate, reviewController.getOrgReviews);

export default router;
