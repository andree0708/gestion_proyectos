import { Router } from 'express';
import * as paymentController from '../controllers/payment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders/:orderId', authenticate, paymentController.createPayment);
router.post('/:id/process', authenticate, paymentController.processPayment);
router.get('/my', authenticate, paymentController.getMyPayments);
router.get('/invoices/:paymentId', authenticate, paymentController.getInvoice);
router.get('/invoices/:paymentId/pdf', paymentController.getInvoicePdf);
router.post('/bank', authenticate, paymentController.saveBankAccount);
router.get('/bank', authenticate, paymentController.getBankAccount);

export default router;