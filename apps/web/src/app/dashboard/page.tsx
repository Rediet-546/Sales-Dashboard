'use client';

import { useState, useEffect } from 'react';
import { FiTrendingUp, FiUsers, FiDollarSign, FiShoppingBag } from 'react-icons/fi';
import KpiCards from '@/components/charts/KpiCards';
import RealTimeChart from '@/components/charts/RealTimeChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState<any>([]);
  const [loading, setLoading] = useState(true);
  const [kpiData, setKpiData] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalOrders: 0,
    growthRate: 0,
  });
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/metrics/user`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setMetrics(data.metrics || []);
        calculateKPIs(data.metrics || []);
        
        // Prepare chart data
        const chartData = data.metrics.map((m: any) => ({
          name: m.name,
          value: m.value,
          category: m.category,
        }));
        setChartData(chartData);
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateKPIs = (metricsData: any[]) => {
    const totalRevenue = metricsData.reduce((sum, m) => sum + m.value, 0);
    const totalUsers = metricsData.filter(m => m.category === 'users').length;
    const totalOrders = metricsData.filter(m => m.category === 'orders').length;
    const growthRate = metricsData.length > 0 ? 12.5 : 0;

    setKpiData({
      totalRevenue,
      totalUsers,
      totalOrders,
      growthRate,
    });
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Dashboard</h1>
        <Badge variant="outline" className="px-4 py-2 bg-white">
          <span className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
            Live Updates
          </span>
        </Badge>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCards
          title="Total Revenue"
          value={`$${kpiData.totalRevenue.toFixed(2)}`}
          icon={<FiDollarSign className="text-blue-600" />}
          trend="up"
          trendValue="12.5%"
        />
        <KpiCards
          title="Total Users"
          value={kpiData.totalUsers.toString()}
          icon={<FiUsers className="text-green-600" />}
          trend="up"
          trendValue="8.2%"
        />
        <KpiCards
          title="Total Orders"
          value={kpiData.totalOrders.toString()}
          icon={<FiShoppingBag className="text-purple-600" />}
          trend="up"
          trendValue="15.3%"
        />
        <KpiCards
          title="Growth Rate"
          value={`${kpiData.growthRate}%`}
          icon={<FiTrendingUp className="text-orange-600" />}
          trend="up"
          trendValue="3.1%"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RealTimeChart
          type="line"
          data={chartData}
          title="Revenue Trends (Live)"
          height={300}
        />
        <RealTimeChart
          type="bar"
          data={chartData.slice(0, 8)}
          title="Category Performance"
          height={300}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RealTimeChart
            type="area"
            data={chartData}
            title="Cumulative Growth"
            height={250}
          />
        </div>
        <div className="space-y-6">
          <Card className="p-4 md:p-6 bg-white shadow-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm text-gray-600">Average Order Value</span>
                <span className="font-semibold text-gray-900">$147.32</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm text-gray-600">Conversion Rate</span>
                <span className="font-semibold text-gray-900">3.87%</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-purple-50 rounded-lg">
                <span className="text-sm text-gray-600">Active Users</span>
                <span className="font-semibold text-gray-900">1,284</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}