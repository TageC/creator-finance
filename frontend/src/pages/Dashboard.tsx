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

  if (loading) return <div className="text-center py-8">Loading...</div>;
  if (!data) return <div className="text-center py-8">Error loading dashboard</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Total Earnings</p>
          <p className="text-4xl font-bold text-blue-600 mt-2">${data.totalEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">This Month</p>
          <p className="text-4xl font-bold text-green-600 mt-2">${data.monthlyEarnings.toFixed(2)}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <p className="text-gray-600 text-sm font-medium">Connected Platforms</p>
          <p className="text-4xl font-bold text-purple-600 mt-2">{data.connectedPlatforms.length}</p>
          <p className="text-xs text-gray-500 mt-2">{data.connectedPlatforms.join(', ') || 'None yet'}</p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">1</div>
            <div>
              <p className="font-semibold">Connect YouTube</p>
              <p className="text-sm text-gray-600">Sync your YouTube earnings automatically</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">2</div>
            <div>
              <p className="font-semibold">Connect Twitch (Optional)</p>
              <p className="text-sm text-gray-600">Add Twitch subscriptions and bits</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold flex-shrink-0">3</div>
            <div>
              <p className="font-semibold">Track Expenses</p>
              <p className="text-sm text-gray-600">Upload receipts and categorize deductions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;