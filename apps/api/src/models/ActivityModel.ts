import { prisma } from '../config/database';

export class ActivityModel {
  static async create(data: any) {
    return prisma.activity.create({
      data: {
        action: data.action,
        description: data.description,
        type: data.type || 'action',
        metadata: data.metadata || {},
        userId: data.userId,
      },
    });
  }

  static async findByUser(userId: string, limit: number = 20) {
    return prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  static async findByType(userId: string, type: string) {
    return prisma.activity.findMany({
      where: { userId, type },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async logActivity(userId: string, action: string, description: string, type: string = 'action', metadata?: any) {
    return this.create({
      action,
      description,
      type,
      metadata,
      userId,
    });
  }
}