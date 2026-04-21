import { Router } from 'express';
import * as listingController from '../controllers/listing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, listingController.createListing);
router.get('/my', authenticate, listingController.getMyListings);
router.get('/:id', listingController.getListingById);
router.put('/:id', authenticate, listingController.updateListing);
router.delete('/:id', authenticate, listingController.deleteListing);
router.post('/:id/publish', authenticate, listingController.publishListing);

router.post('/upload/photos', authenticate, listingController.uploadPhotos);
router.post('/upload/technical-sheet', authenticate, listingController.uploadTechnicalSheet);

router.get('/admin/pending', authenticate, authorize('admin', 'moderator'), listingController.getPendingListings);
router.put('/admin/approve/:id', authenticate, authorize('admin', 'moderator'), listingController.approveListing);
router.put('/admin/reject/:id', authenticate, authorize('admin', 'moderator'), listingController.rejectListing);

export default router;