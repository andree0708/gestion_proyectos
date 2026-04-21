import { Router } from 'express';
import * as kybController from '../controllers/kyb.controller.js';
import { authenticate, authorize } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/submit', authenticate, kybController.submitKyb);
router.get('/admin/pending', authenticate, authorize('admin', 'moderator'), kybController.getPendingKyb);
router.put('/admin/approve/:orgId', authenticate, authorize('admin', 'moderator'), kybController.approveKyb);
router.put('/admin/reject/:orgId', authenticate, authorize('admin', 'moderator'), kybController.rejectKyb);

export default router;