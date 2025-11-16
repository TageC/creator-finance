import React, { useState, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import api from '../utils/api';

interface Expense {
  id: number;
  category: string;
  amount: number;
  date: string;
  description: string;
}

const Expenses: React.FC = () => {
  const { getToken } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ category: '', amount: '', date: '', description: '' });
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    fetchExpenses();
  }, [getToken]);

  const fetchExpenses = async () => {
    try {
      const token = await getToken();
      const res = await api.get('/expenses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setExpenses(res.data);
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = await getToken();
      await api.post('/expenses', formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFormData({ category: '', amount: '', date: '', description: '' });
      setShowForm(false);
      fetchExpenses();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + parseFloat(e.amount.toString()), 0);
  
  const categoryIcons: { [key: string]: string } = {
    'Equipment': '🎥',
    'Software': '💻',
    'Home Office': '🏠',
    'Travel': '✈️',
    'Other': '📦',
  };

  return (
    <div style={{ padding: '40px' }}>
      <h1 style={{ marginBottom: '30px', color: '#1a1a2e' }}>💸 Expenses</h1>

      {/* Total Card */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        borderLeft: '4px solid #ff6b6b',
        marginBottom: '30px',
      }}>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '10px' }}>Total Expenses</div>
        <div style={{ fontSize: '36px', fontWeight: 'bold', color: '#ff6b6b' }}>
          ${totalExpenses.toFixed(2)}
        </div>
      </div>

      {/* Add Expense Form */}
      <div style={{
        backgroundColor: 'white',
        padding: '25px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
        marginBottom: '30px',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ color: '#1a1a2e' }}>Add Expense</h2>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              backgroundColor: '#ff6b6b',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background-color 0.3s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff5555')}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
          >
            {showForm ? 'Cancel' : '+ Add'}
          </button>
        </div>

        {showForm && (
          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '15px' }}>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
              required
            >
              <option value="">Select Category</option>
              <option value="Equipment">Equipment</option>
              <option value="Software">Software</option>
              <option value="Home Office">Home Office</option>
              <option value="Travel">Travel</option>
              <option value="Other">Other</option>
            </select>
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
            <input
              type="text"
              placeholder="Description (optional)"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              style={{
                padding: '12px',
                border: '1px solid #ddd',
                borderRadius: '6px',
                fontSize: '14px',
              }}
            />
            <button
              type="submit"
              style={{
                padding: '12px',
                backgroundColor: '#ff6b6b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 'bold',
                cursor: 'pointer',
                transition: 'background-color 0.3s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#ff5555')}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#ff6b6b')}
            >
              Add Expense
            </button>
          </form>
        )}
      </div>

      {/* Expenses List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#888' }}>Loading...</div>
      ) : expenses.length === 0 ? (
        <div style={{
          backgroundColor: 'white',
          padding: '40px',
          borderRadius: '12px',
          textAlign: 'center',
          color: '#888',
        }}>
          No expenses yet. Track your deductions!
        </div>
      ) : (
        <div style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}>
          {expenses.map((e, idx) => (
            <div
              key={e.id}
              style={{
                padding: '20px 25px',
                borderBottom: idx < expenses.length - 1 ? '1px solid #f0f0f0' : 'none',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ fontSize: '24px' }}>
                  {categoryIcons[e.category] || '📦'}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', color: '#1a1a2e', marginBottom: '5px' }}>
                    {e.category}
                  </div>
                  <div style={{ color: '#888', fontSize: '14px' }}>
                    {new Date(e.date).toLocaleDateString()} {e.description && `• ${e.description}`}
                  </div>
                </div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 'bold', color: '#ff6b6b' }}>
                -${parseFloat(e.amount.toString()).toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Expenses;