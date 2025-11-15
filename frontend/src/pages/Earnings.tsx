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
      fetchEarnings();
    } catch (error) {
      console.error('Failed to add earning:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Earnings</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Add Manual Earning</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Source (e.g., Sponsorship)"
            value={formData.source}
            onChange={(e) => setFormData({ ...formData, source: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="number"
            placeholder="Amount"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
            required
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Add Earning
          </button>
        </form>
      </div>

      {loading ? (
        <div className="text-center">Loading...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-100 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold">Source</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Platform</th>
              </tr>
            </thead>
            <tbody>
              {earnings.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{e.source}</td>
                  <td className="px-6 py-3 font-semibold text-green-600">${e.amount.toFixed(2)}</td>
                  <td className="px-6 py-3">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{e.platform || 'Manual'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Earnings;