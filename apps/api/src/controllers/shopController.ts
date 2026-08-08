import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { ActivityModel } from '../models/ActivityModel';

export class ShopController {
  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = req.body;

      const shop = await prisma.shop.create({
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          currency: data.currency || 'USD',
          timezone: data.timezone || 'UTC',
          settings: {
            create: {
              taxRate: data.taxRate || 0,
              invoicePrefix: data.invoicePrefix || 'INV-',
              lowStockThreshold: data.lowStockThreshold || 5,
            },
          },
        },
      });

      await ActivityModel.logActivity(
        userId,
        'create',
        `Created shop: ${shop.name}`,
        'shop',
        { shopId: shop.id }
      );

      res.status(201).json({ success: true, shop });
    } catch (error) {
      console.error('Create shop error:', error);
      res.status(500).json({ error: 'Failed to create shop' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const shops = await prisma.shop.findMany({
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
          settings: true,
          _count: {
            select: {
              products: true,
              salesRecords: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      });

      res.json({ shops });
    } catch (error) {
      console.error('Get shops error:', error);
      res.status(500).json({ error: 'Failed to get shops' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const shop = await prisma.shop.findUnique({
        where: { id },
        include: {
          users: true,
          settings: true,
          products: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
          salesRecords: {
            take: 10,
            orderBy: { createdAt: 'desc' },
          },
        },
      });

      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      res.json({ shop });
    } catch (error) {
      console.error('Get shop error:', error);
      res.status(500).json({ error: 'Failed to get shop' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const data = req.body;

      const shop = await prisma.shop.update({
        where: { id },
        data: {
          name: data.name,
          description: data.description,
          address: data.address,
          phone: data.phone,
          email: data.email,
          currency: data.currency,
          timezone: data.timezone,
          isActive: data.isActive,
          settings: data.settings ? {
            update: data.settings,
          } : undefined,
        },
      });

      await ActivityModel.logActivity(
        userId,
        'update',
        `Updated shop: ${shop.name}`,
        'shop',
        { shopId: shop.id }
      );

      res.json({ success: true, shop });
    } catch (error) {
      console.error('Update shop error:', error);
      res.status(500).json({ error: 'Failed to update shop' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const shop = await prisma.shop.findUnique({ where: { id } });
      if (!shop) {
        return res.status(404).json({ error: 'Shop not found' });
      }

      await prisma.shop.update({
        where: { id },
        data: { isActive: false },
      });

      await ActivityModel.logActivity(
        userId,
        'delete',
        `Deactivated shop: ${shop.name}`,
        'shop',
        { shopId: shop.id }
      );

      res.json({ success: true, message: 'Shop deactivated' });
    } catch (error) {
      console.error('Delete shop error:', error);
      res.status(500).json({ error: 'Failed to delete shop' });
    }
  }

  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { shop: true },
      });

      if (!user?.shopId) {
        return res.status(403).json({ error: 'User has no shop assigned' });
      }

      const [totalProducts, totalSales, totalRevenue, lowStock, recentSales] = await Promise.all([
        prisma.product.count({ where: { shopId: user.shopId } }),
        prisma.salesRecord.count({ where: { shopId: user.shopId } }),
        prisma.salesRecord.aggregate({
          where: { shopId: user.shopId, status: 'COMPLETED' },
          _sum: { total: true },
        }),
        prisma.product.findMany({
          where: {
            shopId: user.shopId,
            stock: { lte: prisma.product.fields.minStock },
          },
          take: 10,
        }),
        prisma.salesRecord.findMany({
          where: { shopId: user.shopId },
          include: { product: true, user: true },
          orderBy: { createdAt: 'desc' },
          take: 10,
        }),
      ]);

      res.json({
        dashboard: {
          totalProducts,
          totalSales,
          totalRevenue: totalRevenue._sum.total || 0,
          lowStock: lowStock.length,
          recentSales,
          shop: user.shop,
        },
      });
    } catch (error) {
      console.error('Get shop dashboard error:', error);
      res.status(500).json({ error: 'Failed to get dashboard' });
    }
  }
}