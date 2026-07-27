import { Alert } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository } from './base.repository';
import { redis } from '../config/redis';

export class AlertRepository extends BaseRepository<Alert> {
  constructor() {
    super(prisma.alert);
  }

  async findActiveAlerts(tenantId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: {
        tenantId,
        isActive: true
      },
      include: {
        metric: true
      }
    });
  }

  async findByMetric(metricId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: {
        metricId,
        isActive: true
      }
    });
  }

  async createAlert(data: any): Promise<Alert> {
    const alert = await prisma.alert.create({
      data,
      include: {
        metric: true
      }
    });

    // Clear cache
    await redis.del(`alerts:${data.tenantId}`);

    return alert;
  }

  async updateAlert(id: string, data: any): Promise<Alert> {
    const alert = await prisma.alert.update({
      where: { id },
      data,
      include: {
        metric: true
      }
    });

    await redis.del(`alerts:${alert.tenantId}`);

    return alert;
  }

  async checkAlertCondition(
    metricId: string,
    currentValue: number
  ): Promise<Alert | null> {
    const alerts = await prisma.alert.findMany({
      where: {
        metricId,
        isActive: true
      }
    });

    for (const alert of alerts) {
      let triggered = false;

      switch (alert.condition) {
        case 'GREATER_THAN':
          triggered = currentValue > alert.threshold;
          break;
        case 'LESS_THAN':
          triggered = currentValue < alert.threshold;
          break;
        case 'EQUALS':
          triggered = currentValue === alert.threshold;
          break;
        case 'NOT_EQUALS':
          triggered = currentValue !== alert.threshold;
          break;
        case 'CHANGED_PERCENT':
          const previous = await prisma.metricData.findFirst({
            where: { metricId },
            orderBy: { timestamp: 'desc' },
            skip: 1
          });
          if (previous) {
            const changePercent = ((currentValue - previous.value) / previous.value) * 100;
            triggered = Math.abs(changePercent) > alert.threshold;
          }
          break;
        case 'OUTLIER':
          const stats = await prisma.metricData.aggregate({
            where: { metricId },
            _avg: { value: true }
          });
          if (stats._avg.value) {
            const diff = Math.abs(currentValue - stats._avg.value);
            triggered = diff > alert.threshold;
          }
          break;
      }

      if (triggered) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: { lastTriggered: new Date() }
        });

        return alert;
      }
    }

    return null;
  }
}

export const alertRepository = new AlertRepository();