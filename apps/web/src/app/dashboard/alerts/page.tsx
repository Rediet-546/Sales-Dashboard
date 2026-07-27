'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiBell, FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/alerts/user`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (response.ok) {
        setAlerts(data.alerts || []);
      }
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
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
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Alerts</h1>
        <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
          <FiPlus />
          Create Alert
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => (
          <Card key={alert.id} className="p-6 bg-white shadow-lg hover:shadow-xl transition">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{alert.name}</h3>
                <p className="text-sm text-gray-500">
                  Condition: {alert.condition} {alert.threshold}
                </p>
                <div className="mt-2">
                  <Badge variant={alert.status === 'active' ? 'success' : 'secondary'}>
                    {alert.status}
                  </Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                  {alert.status === 'active' ? <FiToggleRight size={20} /> : <FiToggleLeft size={20} />}
                </button>
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

        {alerts.length === 0 && (
          <div className="text-center py-12">
            <FiBell className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No alerts configured. Create your first alert!</p>
          </div>
        )}
      </div>
    </div>
  );
}