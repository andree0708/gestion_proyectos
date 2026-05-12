import { Router } from 'express';
import * as disputeController from '../controllers/dispute.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders/:orderId', authenticate, disputeController.createDispute);
router.get('/my', authenticate, disputeController.getMyDisputes);
router.get('/admin', authenticate, disputeController.getAllDisputes);
router.get('/:id', authenticate, disputeController.getDispute);
router.post('/:id/evidence', authenticate, disputeController.addEvidence);
router.post('/:id/resolve', authenticate, disputeController.resolveDispute);

export default router;