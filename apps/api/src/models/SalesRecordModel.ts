import { prisma } from '../config/database';

export class SalesRecordModel {
  static async create(data: any) {
    return prisma.salesRecord.create({
      data: {
        amount: data.amount,
        currency: data.currency || 'USD',
        status: data.status || 'pending',
        customer: data.customer,
        product: data.product,
        quantity: data.quantity || 1,
        date: data.date || new Date(),
        userId: data.userId,
      },
    });
  }

  static async findByUser(userId: string) {
    return prisma.salesRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
    });
  }

  static async findByStatus(userId: string, status: string) {
    return prisma.salesRecord.findMany({
      where: { userId, status },
      orderBy: { date: 'desc' },
    });
  }

  static async updateStatus(id: string, status: string) {
    return prisma.salesRecord.update({
      where: { id },
      data: { status },
    });
  }

  static async getSalesSummary(userId: string) {
    const records = await this.findByUser(userId);
    const total = records.reduce((sum: number, r: any) => sum + r.amount, 0);
    const completed = records.filter((r: any) => r.status === 'completed');
    const pending = records.filter((r: any) => r.status === 'pending');
    
    return {
      total,
      count: records.length,
      completed: completed.length,
      pending: pending.length,
      completedAmount: completed.reduce((sum: number, r: any) => sum + r.amount, 0),
      pendingAmount: pending.reduce((sum: number, r: any) => sum + r.amount, 0),
    };
  }
}