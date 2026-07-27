import { DashboardModel } from '../models/DashboardModel';
import { MetricModel } from '../models/MetricModel';
import { AlertModel } from '../models/AlertModel';

export class DashboardService {
  static async createDashboard(name: string, description: string | undefined, userId: string) {
    return await DashboardModel.createDashboard({
      name,
      description,
      userId
    });
  }

  static async getUserDashboards(userId: string) {
    return await DashboardModel.findByUser(userId);
  }

  static async getDashboardById(id: string, userId: string) {
    const dashboard = await DashboardModel.findById(id);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    if (dashboard.userId !== userId) {
      throw new Error('You do not have access to this dashboard');
    }
    return dashboard;
  }

  static async updateDashboard(id: string, userId: string, updates: any) {
    const dashboard = await DashboardModel.findById(id);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    if (dashboard.userId !== userId) {
      throw new Error('You do not have access to this dashboard');
    }
    return await DashboardModel.updateDashboard(id, updates);
  }

  static async deleteDashboard(id: string, userId: string) {
    const dashboard = await DashboardModel.findById(id);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    if (dashboard.userId !== userId) {
      throw new Error('You do not have access to this dashboard');
    }
    return await DashboardModel.deleteDashboard(id);
  }

  static async getDashboardAnalytics(id: string, userId: string) {
    const dashboard = await DashboardModel.findById(id);
    if (!dashboard) {
      throw new Error('Dashboard not found');
    }
    if (dashboard.userId !== userId) {
      throw new Error('You do not have access to this dashboard');
    }

    const metrics = await MetricModel.findByDashboard(id);
    
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

    return analytics;
  }
}