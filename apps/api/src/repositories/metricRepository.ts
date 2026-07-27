import { Prisma, Metric, MetricData } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository } from './base.repository';
import { redis } from '../config/redis';
import logger from '../utils/logger';

export class MetricRepository extends BaseRepository<Metric> {
  constructor() {
    super(prisma.metric);
  }

  async findById(id: string): Promise<Metric | null> {
    // Try cache first
    const cached = await redis.get(`metric:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const metric = await prisma.metric.findUnique({
      where: { id },
      include: {
        metricData: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });

    if (metric) {
      // Cache for 5 minutes
      await redis.setex(`metric:${id}`, 300, JSON.stringify(metric));
    }

    return metric;
  }

  async findByTenant(tenantId: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: {
        tenantId,
        isActive: true
      },
      include: {
        metricData: {
          orderBy: { timestamp: 'desc' },
          take: 1
        }
      }
    });
  }

  async addDataPoint(
    metricId: string,
    value: number,
    timestamp: Date = new Date(),
    metadata?: any
  ): Promise<MetricData> {
    const data = await prisma.metricData.create({
      data: {
        metricId,
        value,
        timestamp,
        metadata: metadata || {}
      }
    });

    // Invalidate cache
    await redis.del(`metric:${metricId}`);
    await redis.del(`metricData:${metricId}:latest`);

    return data;
  }

  async getMetricHistory(
    metricId: string,
    startDate: Date,
    endDate: Date,
    aggregation: 'hour' | 'day' | 'week' | 'month' = 'day'
  ): Promise<any[]> {
    const cacheKey = `metric:${metricId}:history:${startDate.toISOString()}:${endDate.toISOString()}:${aggregation}`;
    
    // Try cache
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const intervalMap = {
      hour: '1 hour',
      day: '1 day',
      week: '7 days',
      month: '1 month'
    };

    const data = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC(${aggregation}, timestamp) as period,
        AVG(value) as avg,
        SUM(value) as total,
        MIN(value) as min,
        MAX(value) as max,
        COUNT(*) as count
      FROM metric_data
      WHERE 
        metric_id = ${metricId}
        AND timestamp >= ${startDate}
        AND timestamp <= ${endDate}
      GROUP BY DATE_TRUNC(${aggregation}, timestamp)
      ORDER BY period ASC
    `;

    // Cache for 10 minutes
    await redis.setex(cacheKey, 600, JSON.stringify(data));

    return data as any[];
  }

  async getLatestValues(metricIds: string[]): Promise<Map<string, number>> {
    const result = new Map<string, number>();

    const latestData = await prisma.$queryRaw`
      SELECT DISTINCT ON (metric_id) 
        metric_id, 
        value,
        timestamp
      FROM metric_data
      WHERE metric_id = ANY(${metricIds})
      ORDER BY metric_id, timestamp DESC
    `;

    (latestData as any[]).forEach(row => {
      result.set(row.metric_id, row.value);
    });

    return result;
  }

  async getMetricTrend(
    metricId: string,
    days: number = 30
  ): Promise<{
    trend: 'up' | 'down' | 'stable';
    changePercentage: number;
    data: any[];
  }> {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const data = await prisma.metricData.findMany({
      where: {
        metricId,
        timestamp: {
          gte: startDate,
          lte: endDate
        }
      },
      orderBy: { timestamp: 'asc' }
    });

    if (data.length < 2) {
      return { trend: 'stable', changePercentage: 0, data };
    }

    const firstHalf = data.slice(0, Math.floor(data.length / 2));
    const secondHalf = data.slice(Math.floor(data.length / 2));
    
    const avgFirst = firstHalf.reduce((s: number, d: { value: number }) => s + d.value, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((s: number, d: { value: number }) => s + d.value, 0) / secondHalf.length;
    
    const changePercentage = ((avgSecond - avgFirst) / avgFirst) * 100;
    const trend = changePercentage > 5 ? 'up' : changePercentage < -5 ? 'down' : 'stable';

    return { trend, changePercentage, data };
  }

  async bulkAddDataPoints(
    metricId: string,
    dataPoints: { value: number; timestamp: Date; metadata?: any }[]
  ): Promise<number> {
    const result = await prisma.metricData.createMany({
      data: dataPoints.map(dp => ({
        metricId,
        value: dp.value,
        timestamp: dp.timestamp,
        metadata: dp.metadata || {}
      }))
    });

    // Invalidate cache
    await redis.del(`metric:${metricId}`);
    
    return result.count;
  }

  async getMetricSummary(metricId: string): Promise<any> {
    const cacheKey = `metric:${metricId}:summary`;
    
    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }

    const result = await prisma.metricData.aggregate({
      where: { metricId },
      _avg: { value: true },
      _sum: { value: true },
      _min: { value: true },
      _max: { value: true },
      _count: true
    });

    const latest = await prisma.metricData.findFirst({
      where: { metricId },
      orderBy: { timestamp: 'desc' }
    });

    const summary = {
      ...result,
      latest: latest?.value,
      latestTimestamp: latest?.timestamp
    };

    await redis.setex(cacheKey, 300, JSON.stringify(summary));

    return summary;
  }

  async getMetricsByCategory(tenantId: string, category: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: {
        tenantId,
        category: category as any,
        isActive: true
      }
    });
  }

  async searchMetrics(tenantId: string, searchTerm: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: {
        tenantId,
        isActive: true,
        OR: [
          { name: { contains: searchTerm, mode: 'insensitive' } },
          { description: { contains: searchTerm, mode: 'insensitive' } }
        ]
      }
    });
  }

  async deleteMetric(metricId: string): Promise<Metric> {
    // Delete all associated data first
    await prisma.metricData.deleteMany({
      where: { metricId }
    });

    const metric = await prisma.metric.delete({
      where: { id: metricId }
    });

    // Clear cache
    await redis.del(`metric:${metricId}`);

    return metric;
  }
}

export const metricRepository = new MetricRepository();