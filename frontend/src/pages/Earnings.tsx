import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

interface Earning {
  id: number;
  source: string;
  amount: number;
  date: string;
  platform: string;
}

const Earnings: React.FC = () => {
  const { getToken } = useAuth();
  const [earnings, setEarnings] = useState<Earning[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ source: '', amount: '', date: '', platform: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchEarnings();
  }, [getToken]);

  const fetchEarnings = async () => {
    try {
      const token = await getToken();
      const res = await api.get('/earnings', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEarnings(res.data);
    } catch (error) {
      console.error('Failed to fetch earnings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await api.post('/earnings', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ source: '', amount: '', date: '', platform: '' });
      setShowForm(false);
      fetchEarnings();
    } catch (error) {
      console.error('Failed to add earning:', error);
    }
  };

  const totalEarnings = earnings.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1a1a2e' }}>💰 Earnings</h1>

      {/* Total Card */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #00ff88',
        marginBottom: '30px',
      }}>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Total Earnings</div>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#00ff88' }}>
          ${totalEarnings.toFixed(2)}
        </div>
      </div>

      {/* Add Earning Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1a1a2e' }}>Add Earning</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#00d4ff',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00b8d4')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00d4ff')}
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <input
              type="text"
              placeholder="Source (e.g., Sponsorship)"
              value={formData.source}
              onChange={(e) => setFormData({ ...formData, source: e.target.value })}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            />
            <input
              type="number"
              placeholder="Amount"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            />
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            />
            <button
              type="submit"
              style={{
                padding: '12px',
                backgroundColor: '#00ff88',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#00dd77')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#00ff88')}
            >
              Add Earning
            </button>
          </form>
        )}
      </div>

      {/* Earnings List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
      ) : earnings.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#888',
        }}>
          No earnings yet. Add one to get started!
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {earnings.map((e, idx) => (
            <div
              key={e.id}
              style={{
                padding: '20px 25px',
                borderBottom: idx < earnings.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <div style={{ fontWeight: 'bold', color: '#1a1a2e', marginBottom: '5px' }}>
                  {e.source}
                </div>
                <div style={{ color: '#888', fontSize: '14px' }}>
                  {new Date(e.date).toLocaleDateString()} • {e.platform || 'Manual'}
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#00ff88' }}>
                ${parseFloat(e.amount.toString()).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Earnings;