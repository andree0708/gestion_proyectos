import { Router } from 'express';
import * as catalogController from '../controllers/catalog.controller.js';

const router = Router();

router.get('/search', catalogController.searchListings);
router.get('/map', catalogController.getListingsMap);
router.get('/categories', catalogController.getFeaturedCategories);

export default router;