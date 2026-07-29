import { format } from 'date-fns';

export type DashboardMetric = {
  id?: string;
  name: string;
  value: number;
  unit?: string | null;
  category: string;
  date?: string | Date | null;
};

type ChartPoint = {
  name: string;
  value: number;
};

type TopMetric = {
  name: string;
  value: number;
  unit: string;
  category: string;
};

export type DashboardViewData = {
  totalRevenue: number;
  activeUsers: number;
  averageValue: number;
  topMetric: TopMetric | null;
  revenueGrowth: number;
  totalMetrics: number;
  categoryTotals: ChartPoint[];
  categoryCounts: ChartPoint[];
  metricTrend: ChartPoint[];
  cumulativeTrend: ChartPoint[];
  topMetrics: TopMetric[];
};

export const seedMetrics: DashboardMetric[] = [
  { name: 'Monthly Revenue', value: 45230, unit: '$', category: 'revenue', date: '2026-07-01' },
  { name: 'Annual Revenue', value: 542760, unit: '$', category: 'revenue', date: '2026-06-20' },
  { name: 'Revenue Growth', value: 12.5, unit: '%', category: 'revenue', date: '2026-07-10' },
  { name: 'Average Order Value', value: 147.32, unit: '$', category: 'revenue', date: '2026-07-15' },
  { name: 'Customer Lifetime Value', value: 1240.5, unit: '$', category: 'revenue', date: '2026-07-22' },
  { name: 'Active Users', value: 1247, unit: '', category: 'users', date: '2026-07-02' },
  { name: 'New Signups', value: 89, unit: '', category: 'users', date: '2026-07-05' },
  { name: 'Website Traffic', value: 4523, unit: '', category: 'users', date: '2026-07-08' },
  { name: 'Social Media Engagement', value: 2345, unit: '', category: 'users', date: '2026-07-12' },
  { name: 'Mobile Users', value: 678, unit: '', category: 'users', date: '2026-07-18' },
  { name: 'Conversion Rate', value: 3.87, unit: '%', category: 'performance', date: '2026-07-03' },
  { name: 'Customer Satisfaction', value: 4.8, unit: '/5', category: 'performance', date: '2026-07-06' },
  { name: 'Email Open Rate', value: 28.5, unit: '%', category: 'performance', date: '2026-07-09' },
  { name: 'Bounce Rate', value: 15.2, unit: '%', category: 'performance', date: '2026-07-11' },
  { name: 'Page Load Time', value: 1.8, unit: 's', category: 'performance', date: '2026-07-16' },
  { name: 'Q1 Sales', value: 125000, unit: '$', category: 'sales', date: '2026-04-01' },
  { name: 'Q2 Sales', value: 145000, unit: '$', category: 'sales', date: '2026-05-01' },
  { name: 'Q3 Sales', value: 162000, unit: '$', category: 'sales', date: '2026-06-01' },
  { name: 'Q4 Sales', value: 189000, unit: '$', category: 'sales', date: '2026-07-01' },
  { name: 'Year-over-Year Growth', value: 18.5, unit: '%', category: 'sales', date: '2026-07-24' },
  { name: 'Campaign ROI', value: 245, unit: '%', category: 'marketing', date: '2026-07-04' },
  { name: 'Cost Per Acquisition', value: 45.5, unit: '$', category: 'marketing', date: '2026-07-07' },
  { name: 'Lead Conversion', value: 234, unit: '', category: 'marketing', date: '2026-07-13' },
  { name: 'Marketing Spend', value: 12500, unit: '$', category: 'marketing', date: '2026-07-19' },
  { name: 'Channel Performance', value: 8.5, unit: '/10', category: 'marketing', date: '2026-07-25' },
];

const moneyCategories = new Set(['revenue', 'sales']);

function getMetricDate(metric: DashboardMetric, fallbackOffset: number) {
  const parsed = metric.date ? new Date(metric.date) : null;
  if (parsed && !Number.isNaN(parsed.getTime())) {
    return parsed;
  }

  const base = new Date();
  base.setDate(base.getDate() - fallbackOffset);
  return base;
}

function groupBy<T>(items: T[], keyFn: (item: T) => string) {
  return items.reduce<Record<string, T[]>>((acc, item) => {
    const key = keyFn(item);
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(item);
    return acc;
  }, {});
}

function sum(values: number[]) {
  return values.reduce((total, value) => total + value, 0);
}

export function buildDashboardView(metrics: DashboardMetric[]): DashboardViewData {
  const safeMetrics = metrics.length > 0 ? metrics : seedMetrics;
  const normalizedMetrics = safeMetrics.map((metric, index) => ({
    ...metric,
    date: getMetricDate(metric, index),
  }));

  const sortedMetrics = [...normalizedMetrics].sort((a, b) => {
    const aTime = new Date(a.date ?? 0).getTime();
    const bTime = new Date(b.date ?? 0).getTime();
    return aTime - bTime;
  });

  const metricTrendMap = new Map<string, number>();
  sortedMetrics.forEach((metric) => {
    const key = format(new Date(metric.date as Date), 'MMM d');
    metricTrendMap.set(key, (metricTrendMap.get(key) || 0) + metric.value);
  });

  const metricTrend = Array.from(metricTrendMap.entries()).map(([name, value]) => ({
    name,
    value: Number(value.toFixed(2)),
  }));

  const cumulativeTrend = metricTrend.reduce<ChartPoint[]>((acc, point) => {
    const previous = acc.length > 0 ? acc[acc.length - 1].value : 0;
    acc.push({
      name: point.name,
      value: Number((previous + point.value).toFixed(2)),
    });
    return acc;
  }, []);

  const categories = groupBy(normalizedMetrics, (metric) => metric.category);
  const categoryTotals = Object.entries(categories).map(([category, items]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: Number(sum(items.map((item) => item.value)).toFixed(2)),
  }));
  const categoryCounts = Object.entries(categories).map(([category, items]) => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: items.length,
  }));

  const topMetrics = [...normalizedMetrics]
    .sort((a, b) => b.value - a.value)
    .slice(0, 5)
    .map((metric) => ({
      name: metric.name,
      value: Number(metric.value.toFixed(2)),
      unit: metric.unit || '',
      category: metric.category,
    }));

  const revenueMetrics = normalizedMetrics.filter(
    (metric) => moneyCategories.has(metric.category) && metric.unit === '$'
  );
  const totalRevenue = revenueMetrics.reduce((total, metric) => total + metric.value, 0);
  const activeUsers = normalizedMetrics.find((metric) => metric.name === 'Active Users')?.value ?? 0;
  const averageValue =
    normalizedMetrics.length > 0
      ? normalizedMetrics.reduce((total, metric) => total + metric.value, 0) / normalizedMetrics.length
      : 0;
  const topMetric = topMetrics[0] || null;
  const revenueGrowth =
    normalizedMetrics.find((metric) => metric.name === 'Revenue Growth')?.value ??
    normalizedMetrics.find((metric) => metric.name === 'Year-over-Year Growth')?.value ??
    0;

  return {
    totalRevenue: Number(totalRevenue.toFixed(2)),
    activeUsers: Number(activeUsers.toFixed(0)),
    averageValue: Number(averageValue.toFixed(2)),
    topMetric,
    revenueGrowth: Number(revenueGrowth.toFixed(1)),
    totalMetrics: normalizedMetrics.length,
    categoryTotals,
    categoryCounts,
    metricTrend,
    cumulativeTrend,
    topMetrics,
  };
}
