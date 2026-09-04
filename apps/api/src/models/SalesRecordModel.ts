import { prisma } from '../config/database';
import { SaleStatus } from '@prisma/client';

export class SalesRecordModel {
  static async create(data: {
    amount: number;
    currency?: string;
    status?: SaleStatus;
    customer?: string;
    productId?: string;
    quantity?: number;
    date?: Date;
    userId: string;
    invoice?: string;
    discount?: number;
    tax?: number;
    total?: number;
    paymentMethod?: string;
    notes?: string;
    shopId?: string;
  }) {
    // Generate invoice number if not provided
    const invoice = data.invoice || `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Calculate totals if not provided
    const subtotal = data.amount || 0;
    const discount = data.discount || 0;
    const tax = data.tax || 0;
    const total = data.total || (subtotal - discount + tax);

    return prisma.salesRecord.create({
      data: {
        invoice,
        amount: subtotal,
        discount,
        tax,
        total,
        currency: data.currency || 'USD',
        status: data.status || 'PENDING',
        paymentMethod: data.paymentMethod || 'CASH',
        customer: data.customer || '',
        productId: data.productId,
        quantity: data.quantity || 1,
        date: data.date || new Date(),
        shopId: data.shopId,
        notes: data.notes,
        userId: data.userId,
      },
      include: {
        product: true,
        user: true,
        shop: true,
      },
    });
  }

  static async findByUser(userId: string) {
    return prisma.salesRecord.findMany({
      where: { userId },
      include: {
        product: true,
        user: true,
        shop: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  static async findById(id: string) {
    return prisma.salesRecord.findUnique({
      where: { id },
      include: {
        product: true,
        user: true,
        shop: true,
      },
    });
  }

  static async findByStatus(userId: string, status: SaleStatus) {
    return prisma.salesRecord.findMany({
      where: { userId, status },
      include: {
        product: true,
        user: true,
        shop: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  static async updateStatus(id: string, status: SaleStatus) {
    return prisma.salesRecord.update({
      where: { id },
      data: { status },
      include: {
        product: true,
        user: true,
        shop: true,
      },
    });
  }

  static async getSalesSummary(userId: string) {
    const records = await this.findByUser(userId);
    
    const total = records.reduce((sum: number, r: any) => sum + r.total, 0);
    const completed = records.filter((r: any) => r.status === 'COMPLETED');
    const pending = records.filter((r: any) => r.status === 'PENDING');
    
    return {
      total,
      count: records.length,
      completed: completed.length,
      pending: pending.length,
      completedAmount: completed.reduce((sum: number, r: any) => sum + r.total, 0),
      pendingAmount: pending.reduce((sum: number, r: any) => sum + r.total, 0),
    };
  }

  static async getSalesByDateRange(userId: string, startDate: Date, endDate: Date) {
    return prisma.salesRecord.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        product: true,
        user: true,
        shop: true,
      },
      orderBy: { date: 'desc' },
    });
  }

  static async getRecentSales(userId: string, limit: number = 10) {
    return prisma.salesRecord.findMany({
      where: { userId },
      include: {
        product: true,
        user: true,
        shop: true,
      },
      orderBy: { date: 'desc' },
      take: limit,
    });
  }
}