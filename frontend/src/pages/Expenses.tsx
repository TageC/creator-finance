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
      fetchExpenses();
    } catch (error) {
      console.error('Failed to add expense:', error);
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Expenses</h1>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Add Expense</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
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
          <input
            type="text"
            placeholder="Description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg"
          />
          <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700">
            Add Expense
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
                <th className="px-6 py-3 text-left text-sm font-semibold">Category</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Amount</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold">Description</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-3">{e.category}</td>
                  <td className="px-6 py-3 font-semibold text-red-600">-${e.amount.toFixed(2)}</td>
                  <td className="px-6 py-3">{new Date(e.date).toLocaleDateString()}</td>
                  <td className="px-6 py-3">{e.description || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Expenses;