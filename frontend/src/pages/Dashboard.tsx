import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

interface DashboardData {
  totalEarnings: number;
  monthlyEarnings: number;
  connectedPlatforms: string[];
}

const Dashboard: React.FC = () => {
  const { getToken } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = await getToken();
        const res = await api.get('/dashboard/summary', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setData(res.data);
      } catch (error) {
        console.error('Failed to fetch dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [getToken]);

  if (loading) return <div style={{ padding: '40px', textAlign: 'center' }}>Loading...</div>;

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1a1a2e' }}>Dashboard</h1>

      {/* Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '20px',
        marginBottom: '40px',
      }}>
        {/* Total Earnings Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #00d4ff',
        }}>
          <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Total Earnings</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00d4ff' }}>
            ${data?.totalEarnings.toFixed(2)}
          </div>
          <div style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>All time</div>
        </div>

        {/* This Month Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #00ff88',
        }}>
          <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>This Month</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00ff88' }}>
            ${data?.monthlyEarnings.toFixed(2)}
          </div>
          <div style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>Current month</div>
        </div>

        {/* Connected Platforms Card */}
        <div style={{
          backgroundColor: 'white',
          padding: '25px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          borderLeft: '4px solid #ff6b6b',
        }}>
          <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Connected Platforms</div>
          <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b' }}>
            {data?.connectedPlatforms.length || 0}
          </div>
          <div style={{ color: '#aaa', fontSize: '12px', marginTop: '10px' }}>
            {data?.connectedPlatforms.length === 0 ? 'None yet' : data?.connectedPlatforms.join(', ')}
          </div>
        </div>
      </div>

      {/* Getting Started Section */}
      <div style={{
        backgroundColor: 'white',
        padding: '30px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      }}>
        <h2 style={{ marginBottom: '20px', color: '#1a1a2e' }}>Getting Started</h2>
        <div style={{ display: 'grid', gap: '20px' }}>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#00d4ff',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>1</div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>Connect YouTube</div>
              <div style={{ color: '#888', fontSize: '14px' }}>Sync your YouTube earnings automatically</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#00ff88',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>2</div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>Connect Twitch (Optional)</div>
              <div style={{ color: '#888', fontSize: '14px' }}>Add Twitch subscriptions and bits</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '15px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#ff6b6b',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              flexShrink: 0,
            }}>3</div>
            <div>
              <div style={{ fontWeight: 'bold', color: '#1a1a2e' }}>Track Expenses</div>
              <div style={{ color: '#888', fontSize: '14px' }}>Upload receipts and categorize deductions</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};