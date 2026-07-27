import { Prisma, Dashboard } from '@prisma/client';
import { prisma } from '../config/database';
import { BaseRepository } from './base.repository';
import { redis } from '../config/redis';

export class DashboardRepository extends BaseRepository<Dashboard> {
  constructor() {
    super(prisma.dashboard);
  }

  async findById(id: string): Promise<Dashboard | null> {
    const cached = await redis.get(`dashboard:${id}`);
    if (cached) {
      return JSON.parse(cached);
    }

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        metrics: true
      }
    });

    if (dashboard) {
      await redis.setex(`dashboard:${id}`, 300, JSON.stringify(dashboard));
    }

    return dashboard;
  }

  async findByTenant(tenantId: string): Promise<Dashboard[]> {
    return prisma.dashboard.findMany({
      where: { tenantId },
      include: {
        metrics: true
      }
    });
  }

  async getUserDashboards(userId: string): Promise<Dashboard[]> {
    return prisma.dashboard.findMany({
      where: { userId },
      include: {
        metrics: true
      }
    });
  }

  async createDashboard(data: any): Promise<Dashboard> {
    const dashboard = await prisma.dashboard.create({
      data,
      include: {
        metrics: true
      }
    });

    return dashboard;
  }

  async updateDashboard(id: string, data: any): Promise<Dashboard> {
    const dashboard = await prisma.dashboard.update({
      where: { id },
      data,
      include: {
        metrics: true
      }
    });

    // Clear cache
    await redis.del(`dashboard:${id}`);

    return dashboard;
  }

  async shareDashboard(dashboardId: string, userId: string, permissions: any): Promise<void> {
    // Shared dashboard permissions logic
  }

  async removeUserAccess(dashboardId: string, userId: string): Promise<void> {
    // Remove access logic
  }

  async getDashboardPermissions(dashboardId: string, userId: string): Promise<any> {
    return { view: true, edit: true, delete: true };
  }

  async getDefaultDashboard(tenantId: string): Promise<Dashboard | null> {
    return prisma.dashboard.findFirst({
      where: {
        tenantId,
        isDefault: true
      },
      include: {
        metrics: true
      }
    });
  }
}

export const dashboardRepository = new DashboardRepository();