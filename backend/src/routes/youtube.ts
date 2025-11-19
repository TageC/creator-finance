import { Router, Request, Response } from 'express';
import { pool } from '../index';
import axios from 'axios';

const router = Router();

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.NODE_ENV === 'production' 
  ? `${process.env.VERCEL_URL}/api/youtube/callback`
  : 'http://localhost:5000/api/youtube/callback';

// Generate YouTube OAuth URL
router.get('/auth-url', (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const scope = [
      'https://www.googleapis.com/auth/youtube.readonly',
      'https://www.googleapis.com/auth/yt-analytics.readonly'
    ].join(' ');

    const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    authUrl.searchParams.set('client_id', GOOGLE_CLIENT_ID!);
    authUrl.searchParams.set('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('scope', scope);
    authUrl.searchParams.set('access_type', 'offline');
    authUrl.searchParams.set('prompt', 'consent');
    authUrl.searchParams.set('state', userId); // Pass userId in state

    res.json({ authUrl: authUrl.toString() });
  } catch (error) {
    console.error('Auth URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate auth URL' });
  }
});

// Handle OAuth callback
router.get('/callback', async (req: Request, res: Response) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=missing_params`);
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

    // Get YouTube channel info
    const channelResponse = await axios.get(
      'https://www.googleapis.com/youtube/v3/channels',
      {
        params: { part: 'id,snippet', mine: true },
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    if (!channelResponse.data.items || channelResponse.data.items.length === 0) {
      return res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=no_channel`);
    }

    const channel = channelResponse.data.items[0];
    const channelId = channel.id;
    const channelTitle = channel.snippet.title;

    // Store connection in database
    await pool.query(
      `INSERT INTO connected_accounts (user_id, platform, access_token, refresh_token, account_id, connected_at)
       VALUES ($1, 'youtube', $2, $3, $4, NOW())
       ON CONFLICT (user_id, platform) 
       DO UPDATE SET access_token = $2, refresh_token = $3, account_id = $4, connected_at = NOW()`,
      [userId, access_token, refresh_token, JSON.stringify({ id: channelId, title: channelTitle })]
    );

    // Redirect back to frontend
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?youtube_connected=true`);
  } catch (error) {
    console.error('YouTube callback error:', error);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:5173'}?error=auth_failed`);
  }
});

// Sync YouTube earnings
router.post('/sync', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    // Get YouTube connection
    const accountRes = await pool.query(
      'SELECT access_token, refresh_token, account_id FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [userId, 'youtube']
    );

    if (accountRes.rows.length === 0) {
      return res.status(400).json({ error: 'YouTube not connected' });
    }

    let { access_token, refresh_token } = accountRes.rows[0];

    // Helper function to refresh token if needed
    const refreshAccessToken = async () => {
      try {
        const response = await axios.post('https://oauth2.googleapis.com/token', {
          client_id: GOOGLE_CLIENT_ID,
          client_secret: GOOGLE_CLIENT_SECRET,
          refresh_token,
          grant_type: 'refresh_token',
        });

        access_token = response.data.access_token;

        // Update token in database
        await pool.query(
          'UPDATE connected_accounts SET access_token = $1 WHERE user_id = $2 AND platform = $3',
          [access_token, userId, 'youtube']
        );

        return access_token;
      } catch (error) {
        throw new Error('Failed to refresh token');
      }
    };

    // Fetch YouTube Analytics data (last 30 days)
    const endDate = new Date().toISOString().split('T')[0];
    const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    let analyticsData;
    try {
      const response = await axios.get(
        'https://youtubeanalytics.googleapis.com/v2/reports',
        {
          params: {
            ids: 'channel==MINE',
            startDate,
            endDate,
            metrics: 'estimatedRevenue,views,likes,comments,subscribersGained',
            dimensions: 'day',
          },
          headers: { Authorization: `Bearer ${access_token}` },
        }
      );
      analyticsData = response.data;
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Token expired, refresh and retry
        await refreshAccessToken();
        const response = await axios.get(
          'https://youtubeanalytics.googleapis.com/v2/reports',
          {
            params: {
              ids: 'channel==MINE',
              startDate,
              endDate,
              metrics: 'estimatedRevenue,views,likes,comments,subscribersGained',
              dimensions: 'day',
            },
            headers: { Authorization: `Bearer ${access_token}` },
          }
        );
        analyticsData = response.data;
      } else {
        throw error;
      }
    }

    // Process and store analytics data
    let syncedCount = 0;
    if (analyticsData.rows) {
      for (const row of analyticsData.rows) {
        const [date, revenue] = row;

        if (parseFloat(revenue) > 0) {
          await pool.query(
            `INSERT INTO earnings (user_id, source, amount, date, platform, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             ON CONFLICT (user_id, date, platform, source) DO NOTHING`,
            [userId, 'YouTube Ad Revenue', parseFloat(revenue), date, 'youtube']
          );
          syncedCount++;
        }
      }
    }

    res.json({
      success: true,
      synced: syncedCount,
      message: `Successfully synced ${syncedCount} earnings records`,
    });
  } catch (error: any) {
    console.error('YouTube sync error:', error);
    res.status(500).json({
      error: 'Failed to sync YouTube earnings',
      details: error.message,
    });
  }
});

// Check connection status
router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    const result = await pool.query(
      'SELECT account_id, connected_at FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [userId, 'youtube']
    );

    if (result.rows.length === 0) {
      return res.json({ connected: false });
    }

    const accountData = JSON.parse(result.rows[0].account_id);
    res.json({
      connected: true,
      channelId: accountData.id,
      channelTitle: accountData.title,
      connectedAt: result.rows[0].connected_at,
    });
  } catch (error) {
    console.error('YouTube status error:', error);
    res.status(500).json({ error: 'Failed to check YouTube status' });
  }
});

// Disconnect YouTube
router.delete('/disconnect', async (req: Request, res: Response) => {
  try {
    const userId = req.auth?.userId || 'test-user';

    await pool.query(
      'DELETE FROM connected_accounts WHERE user_id = $1 AND platform = $2',
      [userId, 'youtube']
    );

    res.json({ success: true, message: 'YouTube disconnected' });
  } catch (error) {
    console.error('YouTube disconnect error:', error);
    res.status(500).json({ error: 'Failed to disconnect YouTube' });
  }
});

export default router;