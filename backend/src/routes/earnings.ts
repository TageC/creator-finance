import { Router, Request, Response } from 'express';
import { pool } from '../index';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const result = await pool.query(
      'SELECT * FROM earnings WHERE user_id = $1 ORDER BY date DESC',
      [userId]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Earnings fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch earnings' });
  }
});

router.post('/', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const { source, amount, date, platform } = req.body;

    const result = await pool.query(
      `INSERT INTO earnings (user_id, source, amount, date, platform, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING *`,
      [userId, source, amount, date, platform || 'manual']
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Earnings creation error:', error);
    res.status(500).json({ error: 'Failed to create earning' });
  }
});

export default router;