import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders/:orderId', authenticate, paymentController.createPayment);
router.post('/:id/process', authenticate, paymentController.processPayment);
router.get('/my', authenticate, paymentController.getMyPayments);
router.post('/bank', authenticate, paymentController.saveBankAccount);
router.get('/bank', authenticate, paymentController.getBankAccount);

export default router;