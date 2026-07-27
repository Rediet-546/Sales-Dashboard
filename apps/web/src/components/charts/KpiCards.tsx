import { Card } from '@/components/ui/card';
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface KpiCardsProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export default function KpiCards({ title, value, icon, trend, trendValue }: KpiCardsProps) {
  const trendColors = {
    up: 'text-green-600 bg-green-50',
    down: 'text-red-600 bg-red-50',
    neutral: 'text-gray-600 bg-gray-50',
  };

  return (
    <Card className="p-4 sm:p-6 bg-white shadow-lg hover:shadow-xl transition-shadow duration-200 h-full">
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-gray-500 truncate">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 mt-1 sm:mt-2 truncate">{value}</p>
        </div>
        <div className="p-2 sm:p-3 rounded-full bg-blue-50 flex-shrink-0 ml-2 sm:ml-3">
          <div className="text-base sm:text-xl">{icon}</div>
        </div>
      </div>
      {trendValue && (
        <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-1 sm:gap-2">
          <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${trendColors[trend]}`}>
            {trend === 'up' ? <FiTrendingUp className="mr-0.5 sm:mr-1 text-xs sm:text-sm" /> : <FiTrendingDown className="mr-0.5 sm:mr-1 text-xs sm:text-sm" />}
            {trendValue}
          </span>
          <span className="text-[10px] sm:text-xs text-gray-500">vs last month</span>
        </div>
      )}
    </Card>
  );
}