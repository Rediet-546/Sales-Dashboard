import { Alert } from '@prisma/client';
import { prisma } from '../config/database';

export interface IAlertModel {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  status: string;
  metricId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class AlertModel {
  static async createAlert(data: Omit<IAlertModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Alert> {
    return prisma.alert.create({
      data: {
        name: data.name,
        condition: data.condition,
        threshold: data.threshold,
        status: data.status || 'active',
        metricId: data.metricId,
        userId: data.userId
      },
      include: {
        metric: true,
        user: true
      }
    });
  }

  static async findById(id: string): Promise<Alert | null> {
    return prisma.alert.findUnique({
      where: { id },
      include: {
        metric: true,
        user: true
      }
    });
  }

  static async findByUser(userId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { userId },
      include: {
        metric: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async findByMetric(metricId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: { metricId },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async updateAlert(id: string, data: Partial<Omit<IAlertModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data,
      include: {
        metric: true
      }
    });
  }

  static async deleteAlert(id: string): Promise<Alert> {
    return prisma.alert.delete({
      where: { id }
    });
  }

  static async getActiveAlerts(userId: string): Promise<Alert[]> {
    return prisma.alert.findMany({
      where: {
        userId,
        status: 'active'
      },
      include: {
        metric: true
      }
    });
  }

  static async updateAlertStatus(id: string, status: string): Promise<Alert> {
    return prisma.alert.update({
      where: { id },
      data: { status },
      include: {
        metric: true
      }
    });
  }
}