import { Router, Request, Response } from 'express';
import { pool } from '../index';
import axios from 'axios';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.VERCEL_URL}/api/youtube/callback`;

// Step 1: Generate YouTube OAuth URL
router.get('/auth-url', (req: Request, res: Response) => {
  const scope = 'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';
  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${GOOGLE_CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=${encodeURIComponent(scope)}&access_type=offline&prompt=consent`;
  
  res.json({ authUrl });
});

// Step 2: Handle OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code } = req.query;
    
    if (!code) {
      return res.status(400).json({ error: 'No authorization code' });
    }

    // Exchange code for tokens
    const tokenResponse = await axios.post('https://oauth2.googleapis.com/token', {
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: REDIRECT_URI,
    });

    const { access_token, refresh_token } = tokenResponse.data;

    // Get YouTube channel info to extract user ID
    const channelResponse = await axios.get('https://www.googleapis.com/youtube/v3/channels?part=id&mine=true', {
      headers: { Authorization: `Bearer ${access_token}` },
    });

    const channelId = channelResponse.data.items[0].id;

    // For now, store the tokens (in production, you'd extract userId from the token)
    // We'll use the channelId as a temporary identifier
    res.redirect(`${process.env.VERCEL_URL}?youtube_connected=true&channel_id=${channelId}`);
  } catch (error) {
    console.error('YouTube callback error:', error);
    res.status(500).json({ error: 'Failed to authenticate with YouTube' });
  }
});

// Step 3: Save YouTube connection
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';
    const { accessToken, refreshToken, channelId } = req.body;

    await pool.query(
      `INSERT INTO connected_accounts (user_id, platform, access_token, refresh_token, account_id, connected_at)
       VALUES ($1, 'youtube', $2, $3, $4, NOW())
       ON CONFLICT (user_id, platform) DO UPDATE SET access_token = $2, refresh_token = $3, account_id = $4`,
      [userId, accessToken, refreshToken, channelId]
    );

    res.json({ success: true, platform: 'youtube', channelId });
  } catch (error) {
    console.error('YouTube connect error:', error);
    res.status(500).json({ error: 'Failed to save YouTube connection' });
  }
});

// Step 4: Sync YouTube earnings
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    // Get YouTube connection
    const accountRes = await pool.query(
      'SELECT access_token, refresh_token FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [userId, 'youtube']
    );

    if (accountRes.rows.length === 0) {
      return res.status(400).json({ error: 'YouTube not connected' });
    }

    const { access_token, refresh_token } = accountRes.rows[0];

    // Fetch YouTube Analytics (Revenue data)
    // Note: This requires YouTube Analytics API and proper scopes
    try {
      const analyticsResponse = await axios.post(
        'https://youtubeanalytics.googleapis.com/v2/reports',
        {
          ids: 'channel==MINE',
          startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          endDate: new Date().toISOString().split('T')[0],
          metrics: 'estimatedRevenue,estimatedAdRevenue',
          dimensions: 'day',
        },
        {
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );

      // Process analytics data and store in database
      if (analyticsResponse.data.rows) {
        for (const row of analyticsResponse.data.rows) {
          const [date, revenue] = row;
          
          await pool.query(
            `INSERT INTO earnings (user_id, source, amount, date, platform, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT DO NOTHING`,
            [userId, 'YouTube Revenue', parseFloat(revenue), date, 'youtube']
          );
        }
      }

      res.json({ success: true, synced: analyticsResponse.data.rows?.length || 0 });
    } catch (analyticsError) {
      console.error('YouTube Analytics error:', analyticsError);
      res.json({ success: true, message: 'Connected but analytics data unavailable' });
    }
  } catch (error) {
    console.error('YouTube sync error:', error);
    res.status(500).json({ error: 'Failed to sync YouTube earnings' });
  }
});

// Step 5: Check if YouTube is connected
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    const result = await pool.query(
      'SELECT account_id FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [userId, 'youtube']
    );

    res.json({
      connected: result.rows.length > 0,
      channelId: result.rows[0]?.account_id || null,
    });
  } catch (error) {
    console.error('YouTube status error:', error);
    res.status(500).json({ error: 'Failed to check YouTube status' });
  }
});

export default router;