import { Request, Response } from 'express';
import { MetricModel } from '../models/MetricModel';
import { DashboardModel } from '../models/DashboardModel';
import { AlertModel } from '../models/AlertModel';
import { setCache, getCache, deleteCache } from '../config/redis';

export class MetricController {
  static async createMetric(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, value, unit, category, date, dashboardId } = req.body;

      // Validate input
      if (!name || value === undefined || !category || !dashboardId) {
        return res.status(400).json({ error: 'Name, value, category, and dashboardId are required' });
      }

      // Check if dashboard exists and belongs to user
      const dashboard = await DashboardModel.findById(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Create metric
      const metric = await MetricModel.createMetric({
        name,
        value,
        unit,
        category,
        date: date ? new Date(date) : new Date(),
        dashboardId,
        userId
      });

      // Clear cache
      await deleteCache(`metrics:user:${userId}`);
      await deleteCache(`metrics:dashboard:${dashboardId}`);

      res.status(201).json({
        message: 'Metric created successfully',
        metric
      });
    } catch (error) {
      console.error('Create metric error:', error);
      res.status(500).json({ error: 'Failed to create metric' });
    }
  }

  static async getMetricsByUser(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      
      // Check cache
      const cacheKey = `metrics:user:${userId}`;
      const cachedMetrics = await getCache(cacheKey);
      if (cachedMetrics) {
        return res.status(200).json(cachedMetrics);
      }

      // Get metrics
      const metrics = await MetricModel.findByUser(userId);
      
      // Cache results
      await setCache(cacheKey, { metrics }, 300); // Cache for 5 minutes

      res.status(200).json({ metrics });
    } catch (error) {
      console.error('Get metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  static async getMetricsByDashboard(req: Request, res: Response) {
    try {
      const { dashboardId } = req.params;
      const userId = (req as any).user?.id;

      // Check if dashboard exists and belongs to user
      const dashboard = await DashboardModel.findById(dashboardId);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Check cache
      const cacheKey = `metrics:dashboard:${dashboardId}`;
      const cachedMetrics = await getCache(cacheKey);
      if (cachedMetrics) {
        return res.status(200).json(cachedMetrics);
      }

      // Get metrics
      const metrics = await MetricModel.findByDashboard(dashboardId);
      
      // Cache results
      await setCache(cacheKey, { metrics }, 300);

      res.status(200).json({ metrics });
    } catch (error) {
      console.error('Get dashboard metrics error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }

  static async updateMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const updates = req.body;

      // Check if metric exists
      const metric = await MetricModel.findById(id);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }
      if (metric.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this metric' });
      }

      // Update metric
      const updatedMetric = await MetricModel.updateMetric(id, updates);

      // Clear cache
      await deleteCache(`metrics:user:${userId}`);
      await deleteCache(`metrics:dashboard:${metric.dashboardId}`);
      await deleteCache(`metric:${id}`);

      res.status(200).json({
        message: 'Metric updated successfully',
        metric: updatedMetric
      });
    } catch (error) {
      console.error('Update metric error:', error);
      res.status(500).json({ error: 'Failed to update metric' });
    }
  }

  static async deleteMetric(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check if metric exists
      const metric = await MetricModel.findById(id);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }
      if (metric.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this metric' });
      }

      // Delete metric
      await MetricModel.deleteMetric(id);

      // Clear cache
      await deleteCache(`metrics:user:${userId}`);
      await deleteCache(`metrics:dashboard:${metric.dashboardId}`);
      await deleteCache(`metric:${id}`);

      res.status(200).json({ message: 'Metric deleted successfully' });
    } catch (error) {
      console.error('Delete metric error:', error);
      res.status(500).json({ error: 'Failed to delete metric' });
    }
  }

  static async getMetricById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check cache
      const cacheKey = `metric:${id}`;
      const cachedMetric = await getCache(cacheKey);
      if (cachedMetric) {
        return res.status(200).json(cachedMetric);
      }

      // Get metric
      const metric = await MetricModel.findById(id);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }
      if (metric.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this metric' });
      }

      // Cache results
      await setCache(cacheKey, { metric }, 300);

      res.status(200).json({ metric });
    } catch (error) {
      console.error('Get metric error:', error);
      res.status(500).json({ error: 'Failed to fetch metric' });
    }
  }

  static async getMetricsByCategory(req: Request, res: Response) {
    try {
      const { category } = req.params;
      const userId = (req as any).user?.id;

      const metrics = await MetricModel.getMetricsByCategory(userId, category);

      res.status(200).json({ metrics });
    } catch (error) {
      console.error('Get metrics by category error:', error);
      res.status(500).json({ error: 'Failed to fetch metrics' });
    }
  }
}