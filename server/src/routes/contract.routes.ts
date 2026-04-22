import { Router } from 'express';
import * as contractController from '../controllers/contract.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, contractController.createContract);
router.get('/:id', authenticate, contractController.getContract);
router.post('/:contractId/sign', authenticate, contractController.signContract);
router.post('/order/:orderId/delivery', authenticate, contractController.confirmDelivery);

export default router;