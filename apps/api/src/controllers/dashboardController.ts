import { Request, Response } from 'express';
import { DashboardModel } from '../models/DashboardModel';
import { MetricModel } from '../models/MetricModel';
import { setCache, getCache, deleteCache } from '../config/redis';

export class DashboardController {
  static async createDashboard(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({ error: 'Name is required' });
      }

      const dashboard = await DashboardModel.createDashboard({
        name,
        description,
        userId
      });

      // Clear cache
      await deleteCache(`dashboards:user:${userId}`);

      res.status(201).json({
        message: 'Dashboard created successfully',
        dashboard
      });
    } catch (error) {
      console.error('Create dashboard error:', error);
      res.status(500).json({ error: 'Failed to create dashboard' });
    }
  }

  static async getUserDashboards(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // Check cache
      const cacheKey = `dashboards:user:${userId}`;
      const cachedDashboards = await getCache(cacheKey);
      if (cachedDashboards) {
        return res.status(200).json(cachedDashboards);
      }

      const dashboards = await DashboardModel.findByUser(userId);

      // Cache results
      await setCache(cacheKey, { dashboards }, 300);

      res.status(200).json({ dashboards });
    } catch (error) {
      console.error('Get dashboards error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboards' });
    }
  }

  static async getDashboardById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check cache
      const cacheKey = `dashboard:${id}`;
      const cachedDashboard = await getCache(cacheKey);
      if (cachedDashboard) {
        return res.status(200).json(cachedDashboard);
      }

      const dashboard = await DashboardModel.findById(id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Cache results
      await setCache(cacheKey, { dashboard }, 300);

      res.status(200).json({ dashboard });
    } catch (error) {
      console.error('Get dashboard error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard' });
    }
  }

  static async updateDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const updates = req.body;

      // Check if dashboard exists
      const dashboard = await DashboardModel.findById(id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Update dashboard
      const updatedDashboard = await DashboardModel.updateDashboard(id, updates);

      // Clear cache
      await deleteCache(`dashboards:user:${userId}`);
      await deleteCache(`dashboard:${id}`);

      res.status(200).json({
        message: 'Dashboard updated successfully',
        dashboard: updatedDashboard
      });
    } catch (error) {
      console.error('Update dashboard error:', error);
      res.status(500).json({ error: 'Failed to update dashboard' });
    }
  }

  static async deleteDashboard(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check if dashboard exists
      const dashboard = await DashboardModel.findById(id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Delete dashboard
      await DashboardModel.deleteDashboard(id);

      // Clear cache
      await deleteCache(`dashboards:user:${userId}`);
      await deleteCache(`dashboard:${id}`);
      await deleteCache(`metrics:dashboard:${id}`);

      res.status(200).json({ message: 'Dashboard deleted successfully' });
    } catch (error) {
      console.error('Delete dashboard error:', error);
      res.status(500).json({ error: 'Failed to delete dashboard' });
    }
  }

  static async getAllDashboards(req: Request, res: Response) {
    try {
      // Check cache
      const cacheKey = 'dashboards:all';
      const cachedDashboards = await getCache(cacheKey);
      if (cachedDashboards) {
        return res.status(200).json(cachedDashboards);
      }

      const dashboards = await DashboardModel.getAllDashboards();

      // Cache results
      await setCache(cacheKey, { dashboards }, 600);

      res.status(200).json({ dashboards });
    } catch (error) {
      console.error('Get all dashboards error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboards' });
    }
  }

  static async getDashboardAnalytics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check if dashboard exists
      const dashboard = await DashboardModel.findById(id);
      if (!dashboard) {
        return res.status(404).json({ error: 'Dashboard not found' });
      }
      if (dashboard.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this dashboard' });
      }

      // Get metrics
      const metrics = await MetricModel.findByDashboard(id);

      // Calculate analytics
      const analytics = {
        totalMetrics: metrics.length,
        categories: {} as any,
        averageValue: 0,
        maxValue: 0,
        minValue: Infinity,
        metricsByCategory: {} as any
      };

      if (metrics.length > 0) {
        let totalValue = 0;
        
        metrics.forEach(metric => {
          totalValue += metric.value;
          analytics.maxValue = Math.max(analytics.maxValue, metric.value);
          analytics.minValue = Math.min(analytics.minValue, metric.value);
          
          if (!analytics.categories[metric.category]) {
            analytics.categories[metric.category] = 0;
          }
          analytics.categories[metric.category]++;

          if (!analytics.metricsByCategory[metric.category]) {
            analytics.metricsByCategory[metric.category] = [];
          }
          analytics.metricsByCategory[metric.category].push(metric);
        });

        analytics.averageValue = totalValue / metrics.length;
      }

      res.status(200).json({ analytics });
    } catch (error) {
      console.error('Get dashboard analytics error:', error);
      res.status(500).json({ error: 'Failed to fetch analytics' });
    }
  }
}