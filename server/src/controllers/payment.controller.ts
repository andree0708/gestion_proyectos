import { Request, Response } from 'express';
import * as paymentService from '../services/payment.service.js';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    const payment = await paymentService.createPayment(orderId, Number(order.totalAmount));
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { paymentMethodId } = req.body;
    const payment = await paymentService.processPayment(id, paymentMethodId);
    res.json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyPayments = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.orgId;
    const payments = await paymentService.getMyPayments(orgId);
    res.json(payments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const saveBankAccount = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.orgId;
    const { bankName, accountType, accountNumber, accountHolder } = req.body;
    const account = await paymentService.createBankAccount(orgId, { bankName, accountType, accountNumber, accountHolder });
    res.json(account);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getBankAccount = async (req: Request, res: Response) => {
  try {
    const orgId = (req as any).user.orgId;
    const account = await paymentService.getBankAccount(orgId);
    res.json(account || { message: 'No hay cuenta registrada' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import prisma from '../config/db.js';