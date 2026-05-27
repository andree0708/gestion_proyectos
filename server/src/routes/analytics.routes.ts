import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/stats', authenticate, analyticsController.getStats);
router.get('/export/csv', authenticate, analyticsController.exportCsv);
router.get('/export/pdf', authenticate, analyticsController.exportPdf);

export default router;
