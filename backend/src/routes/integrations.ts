import { Router, Request, Response } from 'express';
import { pool } from '../index';

const router = Router();

router.post('/youtube/connect', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const { accessToken, refreshToken } = req.body;

    await pool.query(
      `INSERT INTO connected_accounts (user_id, platform, access_token, refresh_token, connected_at)
       VALUES ($1, 'youtube', $2, $3, NOW())
       ON CONFLICT (user_id, platform) DO UPDATE SET access_token = $2, refresh_token = $3`,
      [userId, accessToken, refreshToken]
    );

    res.json({ success: true, platform: 'youtube' });
  } catch (error) {
    console.error('YouTube connection error:', error);
    res.status(500).json({ error: 'Failed to connect YouTube' });
  }
});

export default router;