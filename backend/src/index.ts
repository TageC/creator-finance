import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { verifyToken } from './middleware/auth';
import dashboardRoutes from './routes/dashboard';
import integrationRoutes from './routes/integrations';
import earningsRoutes from './routes/earnings';
import expenseRoutes from './routes/expenses';

dotenv.config();

const app: Express = express();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use(cors());
app.use(express.json());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/integrations', verifyToken, integrationRoutes);
app.use('/api/earnings', verifyToken, earningsRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});