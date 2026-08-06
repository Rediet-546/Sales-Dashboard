import { Request, Response } from 'express';
import { ProductModel } from '../models/ProductModel';
import { ActivityModel } from '../models/ActivityModel';

export class ProductController {
  static async create(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const data = req.body;

      // Generate SKU if not provided
      if (!data.sku) {
        data.sku = `PRD-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
      }

      const product = await ProductModel.create({ ...data, userId });

      await ActivityModel.logActivity(
        userId,
        'create',
        `Created product: ${product.name}`,
        'product'
      );

      res.status(201).json({ success: true, product });
    } catch (error) {
      console.error('Create product error:', error);
      res.status(500).json({ error: 'Failed to create product' });
    }
  }

  static async getAll(req: Request, res: Response) {
    try {
      const products = await ProductModel.findAll();
      res.json({ products });
    } catch (error) {
      console.error('Get products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }

  static async getById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const product = await ProductModel.findById(id);
      
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      res.json({ product });
    } catch (error) {
      console.error('Get product error:', error);
      res.status(500).json({ error: 'Failed to get product' });
    }
  }

  static async getMyProducts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const products = await ProductModel.findByUser(userId);
      res.json({ products });
    } catch (error) {
      console.error('Get my products error:', error);
      res.status(500).json({ error: 'Failed to get products' });
    }
  }

  static async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const data = req.body;

      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Check if user owns this product or is admin
      if (product.userId !== userId && (req as any).user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      const updated = await ProductModel.update(id, data);

      await ActivityModel.logActivity(
        userId,
        'update',
        `Updated product: ${updated.name}`,
        'product'
      );

      res.json({ success: true, product: updated });
    } catch (error) {
      console.error('Update product error:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  }

  static async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      const product = await ProductModel.findById(id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (product.userId !== userId && (req as any).user?.role !== 'SUPER_ADMIN') {
        return res.status(403).json({ error: 'Unauthorized' });
      }

      await ProductModel.delete(id);

      await ActivityModel.logActivity(
        userId,
        'delete',
        `Deleted product: ${product.name}`,
        'product'
      );

      res.json({ success: true, message: 'Product deleted' });
    } catch (error) {
      console.error('Delete product error:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  }

  static async getLowStock(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const products = await ProductModel.getLowStockProducts(
        (req as any).user?.role === 'SUPER_ADMIN' ? undefined : userId
      );
      res.json({ products });
    } catch (error) {
      console.error('Get low stock error:', error);
      res.status(500).json({ error: 'Failed to get low stock products' });
    }
  }
}