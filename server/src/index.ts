import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import authRoutes from './routes/auth.routes.js';
import kybRoutes from './routes/kyb.routes.js';
import listingRoutes from './routes/listing.routes.js';
import categoryRoutes from './routes/category.routes.js';
import catalogRoutes from './routes/catalog.routes.js';
import alertRoutes from './routes/alert.routes.js';
import offerRoutes from './routes/offer.routes.js';
import contractRoutes from './routes/contract.routes.js';
import orderRoutes from './routes/order.routes.js';
import shipmentRoutes from './routes/shipment.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import disputeRoutes from './routes/dispute.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/auth', authRoutes);
app.use('/api/kyb', kybRoutes);
app.use('/api/listings', listingRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/catalog', catalogRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/offers', offerRoutes);
app.use('/api/contracts', contractRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/shipments', shipmentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/disputes', disputeRoutes);

app.use((err: Error, _req: Request, res: Response) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;