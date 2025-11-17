import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { Pool } from 'pg';
import { verifyToken } from './middleware/auth';
import dashboardRoutes from './routes/dashboard';
import integrationRoutes from './routes/integrations';
import earningsRoutes from './routes/earnings';
import expenseRoutes from './routes/expenses';
import youtubeRoutes from './routes/youtube';
import taxRoutes from './routes/tax';

dotenv.config();

const app: Express = express();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  
  next();
});

app.use(express.json());
app.use(cors());

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.use('/api/dashboard', verifyToken, dashboardRoutes);
app.use('/api/integrations', verifyToken, integrationRoutes);
app.use('/api/earnings', verifyToken, earningsRoutes);
app.use('/api/expenses', verifyToken, expenseRoutes);
app.use('/api/youtube', youtubeRoutes);
app.use('/api/tax', taxRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});