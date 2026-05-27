import { Request, Response } from 'express';
import prisma from '../config/db.js';
import * as paymentService from '../services/payment.service.js';

export const createPayment = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const orgId = (req as any).user.orgId;
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) return res.status(404).json({ error: 'Orden no encontrada' });
    if (order.sellerOrgId === orgId) return res.status(403).json({ error: 'No puedes pagar tu propio producto' });
    const payment = await paymentService.createPayment(orderId, Number(order.totalAmount));
    res.status(201).json(payment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const processPayment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const orgId = (req as any).user.orgId;
    const { paymentMethodId } = req.body;
    const payment = await paymentService.processPayment(id, paymentMethodId, orgId);
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

export const getInvoice = async (req: Request, res: Response) => {
  try {
    const invoice = await paymentService.getInvoiceByPayment(req.params.paymentId);
    if (!invoice) return res.status(404).json({ error: 'Factura no encontrada' });
    res.json(invoice);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getInvoicePdf = async (req: Request, res: Response) => {
  try {
    const invoice = await paymentService.getInvoicePdfData(req.params.paymentId);
    const order = invoice.payment.order as { offer?: { listing?: { title?: string } }; buyer?: { name?: string }; seller?: { name?: string } };
    const html = [
      '<!DOCTYPE html><html><head><meta charset="utf-8">',
      `<title>Factura ${invoice.invoiceNumber}</title>`,
      '<style>body{font-family:sans-serif;padding:40px;max-width:600px;margin:auto}',
      'h1{color:#059669}.row{display:flex;justify-content:space-between;margin:8px 0}',
      '.total{font-size:1.5em;font-weight:bold;color:#059669;margin-top:24px}</style></head><body>',
      `<h1>Factura ${invoice.invoiceNumber}</h1>`,
      `<p>SubPro Exchange • ${new Date(invoice.issuedAt).toLocaleDateString('es-CO')}</p>`,
      `<div class="row"><span>Producto:</span><span>${order.offer?.listing?.title || 'N/A'}</span></div>`,
      `<div class="row"><span>Comprador:</span><span>${order.buyer?.name || ''}</span></div>`,
      `<div class="row"><span>Vendedor:</span><span>${order.seller?.name || ''}</span></div>`,
      `<div class="total">Total: $${Number(invoice.amount).toLocaleString('es-CO')} COP</div>`,
      '<p style="margin-top:40px;color:#666;font-size:12px">Documento generado automáticamente por SubPro Exchange</p>',
      '</body></html>',
    ].join('');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(html);
  } catch (error: any) {
    res.status(404).json({ error: error.message });
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
