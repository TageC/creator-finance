import { Router, Request, Response } from 'express';
import { pool } from '../index';

const router = Router();

router.get('/summary', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    const earningsRes = await pool.query(
      'SELECT SUM(amount) as total FROM earnings WHERE user_id = $1',
      [userId]
    );
    const totalEarnings = parseFloat(earningsRes.rows[0]?.total || 0);

    const monthRes = await pool.query(
      `SELECT SUM(amount) as total FROM earnings 
       WHERE user_id = $1 AND DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())`,
      [userId]
    );
    const monthlyEarnings = parseFloat(monthRes.rows[0]?.total || 0);

    const platformRes = await pool.query(
      'SELECT DISTINCT platform FROM connected_accounts WHERE user_id = $1',
      [userId]
    );
    const connectedPlatforms = platformRes.rows.map((r) => r.platform);

    res.json({
      totalEarnings,
      monthlyEarnings,
      connectedPlatforms,
      accountStatus: 'active',
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch summary' });
  }
});

export default router;