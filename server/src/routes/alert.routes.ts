import { Router } from 'express';
import * as alertController from '../controllers/alert.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.post('/', authenticate, alertController.createAlert);
router.get('/', authenticate, alertController.getUserAlerts);
router.delete('/:id', authenticate, alertController.deleteAlert);
router.put('/:id/toggle', authenticate, alertController.toggleAlert);

export default router;