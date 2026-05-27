import { Response } from 'express';
import { AuthRequest } from '../types/auth.types.js';
import * as messageService from '../services/message.service.js';

export const getMyConversations = async (req: AuthRequest, res: Response) => {
  try {
    const conversations = await messageService.getMyConversations(req.user!.orgId);
    res.json(conversations);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getConversation = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await messageService.getOrCreateConversation(req.params.orderId);
    const messages = await messageService.getMessages(conversation.id);
    res.json({ ...conversation, messages });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const message = await messageService.sendMessage(
      req.params.conversationId,
      req.user!.userId,
      req.body.content
    );
    res.status(201).json(message);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
