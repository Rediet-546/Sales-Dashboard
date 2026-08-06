import { Product } from '@prisma/client';
import { prisma } from '../config/database';

export class ProductModel {
  static async create(data: any): Promise<Product> {
    return prisma.product.create({
      data: {
        name: data.name,
        description: data.description,
        sku: data.sku,
        price: data.price,
        cost: data.cost,
        category: data.category,
        stock: data.stock || 0,
        minStock: data.minStock || 5,
        unit: data.unit || 'pcs',
        images: data.images || [],
        userId: data.userId,
        isActive: true,
      },
    });
  }

  static async findById(id: string): Promise<Product | null> {
    return prisma.product.findUnique({
      where: { id },
      include: { user: true, salesRecords: true },
    });
  }

  static async findByUser(userId: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async findAll(): Promise<Product[]> {
    return prisma.product.findMany({
      where: { isActive: true },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  static async update(id: string, data: any): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data,
    });
  }

  static async delete(id: string): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: { isActive: false },
    });
  }

  static async updateStock(id: string, quantity: number): Promise<Product> {
    return prisma.product.update({
      where: { id },
      data: {
        stock: { increment: quantity },
      },
    });
  }

  static async getLowStockProducts(userId?: string): Promise<Product[]> {
    return prisma.product.findMany({
      where: {
        ...(userId && { userId }),
        stock: { lte: prisma.product.fields.minStock },
        isActive: true,
      },
      orderBy: { stock: 'asc' },
    });
  }
}