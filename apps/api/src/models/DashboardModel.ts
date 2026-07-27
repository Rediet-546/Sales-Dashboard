import { Dashboard } from '@prisma/client';
import { prisma } from '../config/database';

export interface IDashboardModel {
  id: string;
  name: string;
  description?: string;
  userId: string;
  metrics?: any[];
  createdAt: Date;
  updatedAt: Date;
}

export class DashboardModel {
  static async createDashboard(data: Omit<IDashboardModel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Dashboard> {
    return prisma.dashboard.create({
      data: {
        name: data.name,
        description: data.description,
        userId: data.userId
      },
      include: {
        metrics: true
      }
    });
  }

  static async findById(id: string): Promise<Dashboard | null> {
    return prisma.dashboard.findUnique({
      where: { id },
      include: {
        metrics: {
          include: {
            alerts: true
          }
        },
        user: true
      }
    });
  }

  static async findByUser(userId: string): Promise<Dashboard[]> {
    return prisma.dashboard.findMany({
      where: { userId },
      include: {
        metrics: {
          include: {
            alerts: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  static async updateDashboard(id: string, data: Partial<Omit<IDashboardModel, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Dashboard> {
    return prisma.dashboard.update({
      where: { id },
      data: data as any,
      include: {
        metrics: {
          include: {
            alerts: true
          }
        }
      }
    });
  }

  static async deleteDashboard(id: string): Promise<Dashboard> {
    return prisma.dashboard.delete({
      where: { id }
    });
  }

  static async getAllDashboards(): Promise<Dashboard[]> {
    return prisma.dashboard.findMany({
      include: {
        metrics: {
          include: {
            alerts: true
          }
        },
        user: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }
}