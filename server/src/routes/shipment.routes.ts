import { Router } from 'express';
import * as shipmentController from '../controllers/shipment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/orders/:orderId', authenticate, shipmentController.createShipment);
router.put('/:id/status', authenticate, shipmentController.updateStatus);
router.get('/orders/:orderId', authenticate, shipmentController.getByOrder);
router.get('/my', authenticate, shipmentController.getMyShipments);

export default router;