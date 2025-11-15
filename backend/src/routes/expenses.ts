import { Router, Request, Response } from 'express';
import { pool } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const result = await pool.query(
      'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Expenses fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch expenses' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const { category, amount, date, description } = req.body;

    const result = await pool.query(
      `INSERT INTO expenses (user_id, category, amount, date, description, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, category, amount, date, description || '']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Expense creation error:', error);
    res.status(500).json({ error: 'Failed to create expense' });
  }
});

export default router;