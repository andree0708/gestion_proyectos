import { Router } from 'express';
import * as shipmentController from '../controllers/shipment.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/calculate', authenticate, shipmentController.calculateShipping);
router.post('/orders/:orderId', authenticate, shipmentController.createShipment);
router.put('/:id', authenticate, shipmentController.updateShipment);
router.put('/:id/status', authenticate, shipmentController.updateStatus);
router.get('/orders/:orderId', authenticate, shipmentController.getByOrder);
router.get('/tracking/:trackingCode', shipmentController.trackByCode);
router.get('/my', authenticate, shipmentController.getMyShipments);

export default router;