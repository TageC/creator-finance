import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

interface YouTubeConnectProps {
  onConnected?: () => void;
}

const YouTubeConnect: React.FC<YouTubeConnectProps> = ({ onConnected }) => {
  const { getToken } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [loading, setLoading] = useState(true);
  const [channelId, setChannelId] = useState<string | null>(null);

  useEffect(() => {
    checkYouTubeStatus();
  }, [getToken]);

  const checkYouTubeStatus = async () => {
    try {
      const token = await getToken();
      const res = await api.get('/youtube/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setIsConnected(res.data.connected);
      setChannelId(res.data.channelId);
    } catch (error) {
      console.error('Failed to check YouTube status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    try {
      const token = await getToken();
      const res = await api.get('/youtube/auth-url', {
        headers: { Authorization: `Bearer ${token}` },
      });
      window.location.href = res.data.authUrl;
    } catch (error) {
      console.error('Failed to get YouTube auth URL:', error);
    }
  };

  const handleSync = async () => {
    try {
      setLoading(true);
      const token = await getToken();
      await api.post('/youtube/sync', {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('YouTube earnings synced!');
    } catch (error) {
      console.error('Failed to sync YouTube:', error);
      alert('Failed to sync earnings');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (isConnected) {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        padding: '20px',
        borderLeft: '4px solid #ff0000',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ color: '#1a1a2e', marginBottom: '5px', fontWeight: 'bold' }}>
              ✓ YouTube Connected
            </h3>
            <p style={{ color: '#888', fontSize: '14px' }}>
              Channel ID: {channelId}
            </p>
          </div>
          <button
            onClick={handleSync}
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff0000',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              opacity: loading ? 0.7 : 1,
            }}
          >
            {loading ? 'Syncing...' : 'Sync Earnings'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      padding: '20px',
      borderLeft: '4px solid #ff0000',
    }}>
      <h3 style={{ color: '#1a1a2e', marginBottom: '10px', fontWeight: 'bold' }}>
        🎬 Connect YouTube
      </h3>
      <p style={{ color: '#888', fontSize: '14px', marginBottom: '15px' }}>
        Sync your YouTube earnings automatically
      </p>
      <button
        onClick={handleConnect}
        style={{
          padding: '10px 20px',
          backgroundColor: '#ff0000',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          cursor: 'pointer',
          fontWeight: 'bold',
          transition: 'background-color 0.3s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#cc0000')}
        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff0000')}
      >
        Connect YouTube
      </button>
    </div>
  );
};

export default YouTubeConnect;