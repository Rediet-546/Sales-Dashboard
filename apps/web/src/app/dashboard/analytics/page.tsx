'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FiTrendingUp, FiTrendingDown, FiBarChart2, FiPieChart } from 'react-icons/fi';

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        // Process analytics data
        const metrics = data.metrics || [];
        const total = metrics.reduce((sum: number, m: any) => sum + m.value, 0);
        const avg = metrics.length > 0 ? total / metrics.length : 0;
        const categories = [...new Set(metrics.map((m: any) => m.category))];

        setAnalytics({
          totalMetrics: metrics.length,
          totalValue: total,
          averageValue: avg,
          categories: categories,
          categoryCount: categories.length,
        });
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Metrics</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalMetrics || 0}</p>
            </div>
            <FiBarChart2 className="text-blue-600 text-3xl" />
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Value</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.totalValue?.toFixed(2) || 0}</p>
            </div>
            <FiTrendingUp className="text-green-600 text-3xl" />
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Average Value</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.averageValue?.toFixed(2) || 0}</p>
            </div>
            <FiPieChart className="text-purple-600 text-3xl" />
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">{analytics?.categoryCount || 0}</p>
            </div>
            <FiTrendingDown className="text-orange-600 text-3xl" />
          </div>
        </Card>
      </div>

      <Card className="p-6 bg-white shadow-lg">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Category Distribution</h2>
        <div className="space-y-3">
          {analytics?.categories?.map((category: string) => (
            <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-gray-700">{category}</span>
              <span className="text-blue-600 font-medium">
                {analytics.totalMetrics > 0 
                  ? ((analytics.metrics?.filter((m: any) => m.category === category)?.length || 0) / analytics.totalMetrics * 100).toFixed(1)
                  : 0}%
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}