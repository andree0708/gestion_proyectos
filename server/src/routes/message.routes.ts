import { Router } from 'express';
import * as messageController from '../controllers/message.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/my', authenticate, messageController.getMyConversations);
router.get('/order/:orderId', authenticate, messageController.getConversation);
router.post('/:conversationId/messages', authenticate, messageController.sendMessage);

export default router;
