import { Router } from 'express';
import multer from 'multer';
import * as listingController from '../controllers/listing.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';
import path from 'path';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });

router.post('/', authenticate, listingController.createListing);
router.get('/my', authenticate, listingController.getMyListings);
router.get('/:id', listingController.getListingById);
router.put('/:id', authenticate, listingController.updateListing);
router.delete('/:id', authenticate, listingController.deleteListing);
router.post('/:id/publish', authenticate, listingController.publishListing);

router.post('/upload/photos', authenticate, upload.array('photos', 5), listingController.uploadPhotos);
router.post('/upload/technical-sheet', authenticate, upload.single('technicalSheet'), listingController.uploadTechnicalSheet);

router.get('/admin/pending', authenticate, authorize('admin', 'moderator'), listingController.getPendingListings);
router.put('/admin/approve/:id', authenticate, authorize('admin', 'moderator'), listingController.approveListing);
router.put('/admin/reject/:id', authenticate, authorize('admin', 'moderator'), listingController.rejectListing);

export default router;