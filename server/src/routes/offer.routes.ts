import { Router } from 'express';
import * as offerController from '../controllers/offer.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, offerController.createOffer);
router.get('/buyer', authenticate, offerController.getOffersForBuyer);
router.get('/:id', authenticate, offerController.getOfferById);
router.get('/listing/:listingId', authenticate, offerController.getOffersForListing);
router.put('/:id/accept', authenticate, offerController.acceptOffer);
router.put('/:id/reject', authenticate, offerController.rejectOffer);
router.post('/:id/counter', authenticate, offerController.counterOffer);

export default router;