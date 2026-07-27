import { Metric } from '@prisma/client';
import { prisma } from '../config/database';

export interface IMetricModel {
  id: string;
  name: string;
  value: number;
  unit?: string;
  category: string;
  date: Date;
  dashboardId: string;
  userId: string;
  alerts?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class MetricModel {
  static async createMetric(data: Omit<IMetricModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Metric> {
    return prisma.metric.create({
      data: {
        name: data.name,
        value: data.value,
        unit: data.unit,
        category: data.category,
        date: data.date || new Date(),
        dashboardId: data.dashboardId,
        userId: data.userId
      },
      include: {
        alerts: true
      }
    });
  }

  static async findById(id: string): Promise<Metric | null> {
    return prisma.metric.findUnique({
      where: { id },
      include: {
        alerts: true,
        dashboard: true
      }
    });
  }

  static async findByDashboard(dashboardId: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: { dashboardId },
      include: {
        alerts: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  static async findByUser(userId: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: { userId },
      include: {
        alerts: true,
        dashboard: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }

  static async updateMetric(id: string, data: Partial<Omit<IMetricModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Metric> {
    return prisma.metric.update({
      where: { id },
      data: data as any,
      include: {
        alerts: true
      }
    });
  }

  static async deleteMetric(id: string): Promise<Metric> {
    return prisma.metric.delete({
      where: { id }
    });
  }

  static async getMetricsByCategory(userId: string, category: string): Promise<Metric[]> {
    return prisma.metric.findMany({
      where: {
        userId,
        category
      },
      include: {
        alerts: true
      },
      orderBy: {
        date: 'desc'
      }
    });
  }
}