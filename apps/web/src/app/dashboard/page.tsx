'use client';

import { useState, useEffect } from 'react';
import {
  FiTrendingUp,
  FiUsers,
  FiDollarSign,
  FiShoppingBag,
  FiUser,
  FiUserCheck,
  FiAward,
  FiClock,
  FiBarChart2,
} from 'react-icons/fi';
import KpiCards from '@/components/charts/KpiCards';
import RealTimeChart from '@/components/charts/RealTimeChart';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface DashboardData {
  metrics: any[];
  salesRecords: any[];
  user: any;
  team: any[];
  activities: any[];
  totalRevenue: number;
  totalSales: number;
  winRate: number;
  salesPipeline: number;
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('user');

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    setUserRole(user.role || 'user');
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fetch metrics
      const metricsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/metrics/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const metricsData = await metricsRes.json();

      // Fetch user profile
      const profileRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profileData = await profileRes.json();

      // Fetch team members
      const teamRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/team`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const teamData = await teamRes.json();

      // Fetch sales records
      const salesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/sales`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const salesData = await salesRes.json();

      // Fetch activities
      const activitiesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/activities`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const activitiesData = await activitiesRes.json();

      const metrics = metricsData.metrics || [];
      const user = profileData.user || {};
      const team = teamData.team || [];
      const salesRecords = salesData.sales || [];
      const activities = activitiesData.activities || [];

      // Calculate KPIs
      const totalRevenue = metrics
        .filter((m: any) => m.category === 'revenue' || m.category === 'sales')
        .reduce((sum: number, m: any) => sum + m.value, 0);

      const totalSales = salesRecords.filter((r: any) => r.status === 'completed').length;
      const winRate = salesRecords.length > 0 
        ? (totalSales / salesRecords.length) * 100 
        : 0;
      const salesPipeline = salesRecords
        .filter((r: any) => r.status === 'pending')
        .reduce((sum: number, r: any) => sum + r.amount, 0);

      setData({
        metrics,
        salesRecords,
        user,
        team,
        activities,
        totalRevenue,
        totalSales,
        winRate,
        salesPipeline,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (!data) {
    return <div className="text-center py-12">No data available</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header with User Info */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome back, {data.user.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {data.user.role === 'admin' && '🔑 Administrator Access'}
            {data.user.role === 'sales_manager' && '📊 Sales Manager'}
            {data.user.role === 'sales_rep' && '💼 Sales Representative'}
            {data.user.role === 'viewer' && '👀 Viewer'}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-2 bg-white">
            <span className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
              Live Updates
            </span>
          </Badge>
          <Badge variant="outline" className="px-4 py-2 bg-blue-50 text-blue-700">
            <FiUser className="mr-1" /> {data.team.length} Team Members
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <KpiCards
          title="Total Revenue"
          value={`$${data.totalRevenue.toFixed(2)}`}
          icon={<FiDollarSign className="text-blue-600" />}
          trend="up"
          trendValue="12.5%"
        />
        <KpiCards
          title="Sales Pipeline"
          value={`$${data.salesPipeline.toFixed(0)}`}
          icon={<FiShoppingBag className="text-purple-600" />}
          trend="up"
          trendValue="8.2%"
        />
        <KpiCards
          title="Win Rate"
          value={`${data.winRate.toFixed(1)}%`}
          icon={<FiTrendingUp className="text-green-600" />}
          trend="up"
          trendValue="4.3%"
        />
        <KpiCards
          title="Team Members"
          value={data.team.length.toString()}
          icon={<FiUsers className="text-orange-600" />}
          trend="up"
          trendValue="2 new"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Revenue Trend</h3>
          <div className="h-[250px]">
            <RealTimeChart
              type="line"
              data={data.metrics
                .filter((m: any) => m.category === 'revenue' || m.category === 'sales')
                .map((m: any) => ({ name: m.name, value: m.value }))}
              height={250}
            />
          </div>
        </Card>
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Team Performance</h3>
          <div className="h-[250px]">
            <RealTimeChart
              type="bar"
              data={data.team.map((m: any) => ({ 
                name: m.name, 
                value: Math.floor(Math.random() * 100) + 50 
              }))}
              height={250}
            />
          </div>
        </Card>
      </div>

      {/* Team & Activity Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FiUserCheck className="inline mr-2 text-blue-600" />
            Team Members
          </h3>
          <div className="space-y-3">
            {data.team.map((member: any, index: number) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 text-white flex items-center justify-center">
                    {member.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{member.name}</p>
                    <p className="text-sm text-gray-500">{member.role}</p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {member.department || 'Sales'}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            <FiClock className="inline mr-2 text-gray-500" />
            Recent Activity
          </h3>
          <div className="space-y-3">
            {data.activities.slice(0, 6).map((activity: any, index: number) => (
              <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                <div className={`w-2 h-2 rounded-full ${
                  activity.type === 'login' ? 'bg-green-500' :
                  activity.type === 'view' ? 'bg-blue-500' :
                  activity.type === 'create' ? 'bg-yellow-500' :
                  'bg-purple-500'
                }`} />
                <span className="text-sm text-gray-600 flex-1">{activity.description}</span>
                <span className="text-xs text-gray-400">
                  {new Date(activity.createdAt).toLocaleTimeString()}
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Sales Records Table */}
      <Card className="p-6 bg-white shadow-lg">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Sales</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-gray-500">Customer</th>
                <th className="text-left py-2 text-gray-500">Product</th>
                <th className="text-right py-2 text-gray-500">Amount</th>
                <th className="text-left py-2 text-gray-500">Status</th>
                <th className="text-left py-2 text-gray-500">Date</th>
              </tr>
            </thead>
            <tbody>
              {data.salesRecords.slice(0, 5).map((record: any, index: number) => (
                <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-2 font-medium">{record.customer}</td>
                  <td className="py-2">{record.product}</td>
                  <td className="py-2 text-right">${record.amount.toFixed(2)}</td>
                  <td className="py-2">
                    <Badge variant={
                      record.status === 'completed' ? 'success' :
                      record.status === 'pending' ? 'outline' : 'destructive'
                    } className="text-xs">
                      {record.status}
                    </Badge>
                  </td>
                  <td className="py-2 text-gray-500 text-xs">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}