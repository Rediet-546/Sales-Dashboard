'use client';

import { useEffect, useState, type ReactNode } from 'react';
import {
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Area,
  AreaChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { FiActivity, FiDatabase, FiDollarSign, FiPieChart, FiTrendingUp, FiUsers } from 'react-icons/fi';
import KpiCards from '@/components/charts/KpiCards';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  buildDashboardView,
  DashboardMetric,
  DashboardViewData,
  seedMetrics,
} from '@/lib/dashboard-seed-data';

const CHART_COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#14B8A6'];

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState<DashboardViewData>(buildDashboardView(seedMetrics));
  const [loading, setLoading] = useState(true);
  const [sourceLabel, setSourceLabel] = useState<'API seed data' | 'Local seed data'>('Local seed data');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
      const token = localStorage.getItem('token');

      if (apiUrl && token) {
        const response = await fetch(`${apiUrl}/metrics/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (response.ok && Array.isArray(data.metrics) && data.metrics.length > 0) {
          setDashboard(buildDashboardView(data.metrics as DashboardMetric[]));
          setSourceLabel('API seed data');
          return;
        }
      }

      setDashboard(buildDashboardView(seedMetrics));
      setSourceLabel('Local seed data');
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setDashboard(buildDashboardView(seedMetrics));
      setSourceLabel('Local seed data');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) =>
    `$${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;

  const renderCardFrame = (children: ReactNode, className = '') => (
    <Card
      className={`h-full overflow-hidden border-white/60 bg-white/90 shadow-lg shadow-slate-200/60 backdrop-blur ${className}`}
    >
      {children}
    </Card>
  );

  const renderNoData = () => (
    <div className="flex h-[280px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
      No chart data available
    </div>
  );

  const totalValue = dashboard.categoryTotals.reduce((sum, item) => sum + item.value, 0);
  const largestCategoryShare =
    dashboard.categoryCounts.length > 0 && dashboard.totalMetrics > 0
      ? Math.max(...dashboard.categoryCounts.map((item) => item.value)) / dashboard.totalMetrics
      : 0;

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(dashboard.totalRevenue),
      icon: <FiDollarSign className="text-blue-600" />,
      trend: 'up' as const,
      trendValue: `${dashboard.revenueGrowth.toFixed(1)}%`,
    },
    {
      title: 'Active Users',
      value: dashboard.activeUsers.toLocaleString(),
      icon: <FiUsers className="text-emerald-600" />,
      trend: 'up' as const,
      trendValue: 'Seeded users',
    },
    {
      title: 'Average Value',
      value: dashboard.averageValue.toFixed(2),
      icon: <FiActivity className="text-violet-600" />,
      trend: 'neutral' as const,
      trendValue: 'Across all metrics',
    },
    {
      title: 'Top Metric',
      value: dashboard.topMetric ? dashboard.topMetric.name : 'N/A',
      icon: <FiDatabase className="text-orange-600" />,
      trend: 'up' as const,
      trendValue: dashboard.topMetric ? formatCurrency(dashboard.topMetric.value) : 'Seed fallback',
    },
  ];

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/50 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-6 text-white shadow-2xl shadow-slate-900/20">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="w-fit border-white/20 bg-white/10 px-3 py-1 text-white">
              Seed-backed dashboard
            </Badge>
            <div>
              <h1 className="text-3xl font-bold tracking-tight md:text-4xl">Dashboard</h1>
              <p className="mt-2 max-w-2xl text-sm text-slate-300 md:text-base">
                A seeded analytics snapshot with revenue, user, performance, and sales graphs.
              </p>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Source</p>
              <p className="mt-1 text-sm font-semibold">{sourceLabel}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Metrics</p>
              <p className="mt-1 text-sm font-semibold">{dashboard.totalMetrics} seeded points</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-300">Value</p>
              <p className="mt-1 text-sm font-semibold">{formatCurrency(totalValue)}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <KpiCards
            key={card.title}
            title={card.title}
            value={card.value}
            icon={card.icon}
            trend={card.trend}
            trendValue={card.trendValue}
          />
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {renderCardFrame(
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Metric Trend</h3>
                <p className="text-sm text-slate-500">Seeded values over time.</p>
              </div>
              <FiTrendingUp className="text-xl text-blue-600" />
            </div>
            <div className="h-[320px]">
              {dashboard.metricTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dashboard.metricTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="value"
                      stroke="#3B82F6"
                      strokeWidth={3}
                      dot={{ r: 4, fill: '#3B82F6' }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                renderNoData()
              )}
            </div>
          </div>
        )}

        {renderCardFrame(
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Category Breakdown</h3>
                <p className="text-sm text-slate-500">Total value by category.</p>
              </div>
              <FiPieChart className="text-xl text-emerald-600" />
            </div>
            <div className="h-[320px]">
              {dashboard.categoryCounts.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={dashboard.categoryCounts}
                      cx="50%"
                      cy="50%"
                      innerRadius={78}
                      outerRadius={118}
                      paddingAngle={4}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {dashboard.categoryCounts.map((entry, index) => (
                        <Cell key={entry.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                renderNoData()
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {renderCardFrame(
          <div className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Cumulative Growth</h3>
                <p className="text-sm text-slate-500">Running total across the seeded dataset.</p>
              </div>
              <FiTrendingUp className="text-xl text-violet-600" />
            </div>
            <div className="h-[300px]">
              {dashboard.cumulativeTrend.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dashboard.cumulativeTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="cumulativeGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="name" tick={{ fill: '#64748B', fontSize: 12 }} />
                    <YAxis tick={{ fill: '#64748B', fontSize: 12 }} />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: '1px solid #E2E8F0',
                        backgroundColor: '#FFFFFF',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="#8B5CF6"
                      fill="url(#cumulativeGradient)"
                      strokeWidth={3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                renderNoData()
              )}
            </div>
          </div>,
          'xl:col-span-2'
        )}

        <div className="space-y-6">
          {renderCardFrame(
            <div className="p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Top Metrics</h3>
              <div className="space-y-3">
                {dashboard.topMetrics.map((metric, index) => (
                  <div
                    key={`${metric.name}-${index}`}
                    className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">{metric.name}</p>
                      <p className="text-xs text-slate-500">{metric.category}</p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      {metric.unit === '$'
                        ? formatCurrency(metric.value)
                        : `${metric.value.toLocaleString()}${metric.unit}`}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {renderCardFrame(
            <div className="p-5">
              <h3 className="mb-4 text-lg font-semibold text-slate-900">Quick Stats</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-2xl bg-blue-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Category count</span>
                  <span className="font-semibold text-slate-900">{dashboard.categoryTotals.length}</span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-emerald-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Largest category share</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round(largestCategoryShare * 100)}%
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-2xl bg-violet-50 px-4 py-3">
                  <span className="text-sm text-slate-600">Timeline points</span>
                  <span className="font-semibold text-slate-900">{dashboard.metricTrend.length}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
