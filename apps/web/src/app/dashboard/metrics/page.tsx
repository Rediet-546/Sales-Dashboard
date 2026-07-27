'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';

export default function MetricsPage() {
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics || []);
      }
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Metrics</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition whitespace-nowrap">
          <FiPlus />
          Add Metric
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 relative w-full">
          <input
            type="text"
            placeholder="Search metrics..."
            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        <select className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
          <option>All Categories</option>
          <option>Sales</option>
          <option>Users</option>
          <option>Performance</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="p-4 md:p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{metric.name}</h3>
                <p className="text-sm text-gray-500">Category: {metric.category}</p>
                <p className="text-2xl font-bold text-blue-600 mt-2">{metric.value} {metric.unit || ''}</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                  <FiEdit2 />
                </button>
                <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                  <FiTrash2 />
                </button>
              </div>
            </div>
          </Card>
        ))}

        {metrics.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No metrics found. Add your first metric!</p>
          </div>
        )}
      </div>
    </div>
  );
}