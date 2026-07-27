import { Request, Response } from 'express';
import { AlertModel } from '../models/AlertModel';
import { MetricModel } from '../models/MetricModel';
import { setCache, getCache, deleteCache } from '../config/redis';

export class AlertController {
  static async createAlert(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { name, condition, threshold, metricId } = req.body;

      // Validate input
      if (!name || !condition || threshold === undefined || !metricId) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      // Check if metric exists and belongs to user
      const metric = await MetricModel.findById(metricId);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }
      if (metric.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this metric' });
      }

      // Create alert
      const alert = await AlertModel.createAlert({
        name,
        condition,
        threshold,
        metricId,
        userId,
        status: 'active'
      });

      // Clear cache
      await deleteCache(`alerts:user:${userId}`);
      await deleteCache(`alerts:metric:${metricId}`);

      res.status(201).json({
        message: 'Alert created successfully',
        alert
      });
    } catch (error) {
      console.error('Create alert error:', error);
      res.status(500).json({ error: 'Failed to create alert' });
    }
  }

  static async getUserAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // Check cache
      const cacheKey = `alerts:user:${userId}`;
      const cachedAlerts = await getCache(cacheKey);
      if (cachedAlerts) {
        return res.status(200).json(cachedAlerts);
      }

      const alerts = await AlertModel.findByUser(userId);

      // Cache results
      await setCache(cacheKey, { alerts }, 300);

      res.status(200).json({ alerts });
    } catch (error) {
      console.error('Get alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch alerts' });
    }
  }

  static async updateAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const updates = req.body;

      // Check if alert exists
      const alert = await AlertModel.findById(id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      if (alert.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this alert' });
      }

      // Update alert
      const updatedAlert = await AlertModel.updateAlert(id, updates);

      // Clear cache
      await deleteCache(`alerts:user:${userId}`);
      await deleteCache(`alerts:metric:${alert.metricId}`);
      await deleteCache(`alert:${id}`);

      res.status(200).json({
        message: 'Alert updated successfully',
        alert: updatedAlert
      });
    } catch (error) {
      console.error('Update alert error:', error);
      res.status(500).json({ error: 'Failed to update alert' });
    }
  }

  static async deleteAlert(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;

      // Check if alert exists
      const alert = await AlertModel.findById(id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      if (alert.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this alert' });
      }

      // Delete alert
      await AlertModel.deleteAlert(id);

      // Clear cache
      await deleteCache(`alerts:user:${userId}`);
      await deleteCache(`alerts:metric:${alert.metricId}`);
      await deleteCache(`alert:${id}`);

      res.status(200).json({ message: 'Alert deleted successfully' });
    } catch (error) {
      console.error('Delete alert error:', error);
      res.status(500).json({ error: 'Failed to delete alert' });
    }
  }

  static async toggleAlertStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = (req as any).user?.id;
      const { status } = req.body;

      // Check if alert exists
      const alert = await AlertModel.findById(id);
      if (!alert) {
        return res.status(404).json({ error: 'Alert not found' });
      }
      if (alert.userId !== userId) {
        return res.status(403).json({ error: 'You do not have access to this alert' });
      }

      // Update alert status
      const updatedAlert = await AlertModel.updateAlertStatus(id, status);

      // Clear cache
      await deleteCache(`alerts:user:${userId}`);
      await deleteCache(`alerts:metric:${alert.metricId}`);
      await deleteCache(`alert:${id}`);

      res.status(200).json({
        message: 'Alert status updated successfully',
        alert: updatedAlert
      });
    } catch (error) {
      console.error('Toggle alert status error:', error);
      res.status(500).json({ error: 'Failed to update alert status' });
    }
  }

  static async getActiveAlerts(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const alerts = await AlertModel.getActiveAlerts(userId);

      res.status(200).json({ alerts });
    } catch (error) {
      console.error('Get active alerts error:', error);
      res.status(500).json({ error: 'Failed to fetch active alerts' });
    }
  }

  static async checkAlertTriggers(req: Request, res: Response) {
    try {
      const { metricId } = req.params;
      
      const metric = await MetricModel.findById(metricId);
      if (!metric) {
        return res.status(404).json({ error: 'Metric not found' });
      }

      const alerts = await AlertModel.findByMetric(metricId);
      
      const triggeredAlerts = alerts
        .filter(alert => {
          if (alert.status !== 'active') return false;
          
          switch (alert.condition) {
            case 'greater_than':
              return metric.value > alert.threshold;
            case 'less_than':
              return metric.value < alert.threshold;
            case 'equal_to':
              return metric.value === alert.threshold;
            default:
              return false;
          }
        })
        .map(alert => ({
          ...alert,
          triggerMessage: `Metric "${metric.name}" (${metric.value}) ${alert.condition} ${alert.threshold}`
        }));

      res.status(200).json({ 
        triggered: triggeredAlerts,
        count: triggeredAlerts.length
      });
    } catch (error) {
      console.error('Check alert triggers error:', error);
      res.status(500).json({ error: 'Failed to check alert triggers' });
    }
  }
}