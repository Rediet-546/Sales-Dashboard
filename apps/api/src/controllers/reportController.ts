import { Request, Response } from 'express';
import { ReportModel } from '../models/ReportModel';
import { MetricModel } from '../models/MetricModel';
import { DashboardModel } from '../models/DashboardModel';
import { PDFService } from '../services/pdfService';
import { setCache, getCache, deleteCache } from '../config/redis';

export class ReportController {
  /**
   * Create a new report
   * POST /api/reports
   */
  static async createReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        name, 
        description, 
        type, 
        data, 
        dashboardId,
        dateRange,
        metrics,
        format 
      } = req.body;

      if (!name || !type) {
        return res.status(400).json({ 
          error: 'Name and type are required' 
        });
      }

      // Prepare report data
      let reportData = data;
      
      if (!reportData) {
        // Generate data based on type
        reportData = await this.generateReportData({
          userId,
          dashboardId,
          metrics,
          type,
          dateRange: dateRange || { start: new Date(), end: new Date() }
        });
      }

      // Create report
      const report = await ReportModel.createReport({
        name,
        description: description || '',
        type,
        data: reportData,
        userId
      });

      // Clear cache
      await deleteCache(`reports:user:${userId}`);
      await deleteCache(`reports:dashboard:${dashboardId || 'all'}`);

      res.status(201).json({
        success: true,
        message: 'Report created successfully',
        data: report
      });
    } catch (error) {
      console.error('Create Report error:', error);
      res.status(500).json({ 
        error: 'Failed to create report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get all reports for user
   * GET /api/reports/user
   */
  static async getUserReports(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { limit, offset, type } = req.query;

      // Check cache
      const cacheKey = `reports:user:${userId}:${type || 'all'}:${limit || 20}:${offset || 0}`;
      const cachedReports = await getCache(cacheKey);
      
      if (cachedReports) {
        return res.status(200).json({
          success: true,
          data: cachedReports
        });
      }

      // Get reports
      let reports = await ReportModel.findByUser(userId);
      
      // Filter by type if specified
      if (type) {
        reports = reports.filter(report => report.type === type);
      }

      // Apply pagination
      const paginatedReports = reports.slice(
        offset ? parseInt(offset as string) : 0,
        limit ? parseInt(limit as string) + (offset ? parseInt(offset as string) : 0) : reports.length
      );

      // Cache results
      await setCache(cacheKey, {
        reports: paginatedReports,
        total: reports.length,
        limit: parseInt(limit as string) || 20,
        offset: parseInt(offset as string) || 0
      }, 300);

      res.status(200).json({
        success: true,
        data: {
          reports: paginatedReports,
          total: reports.length,
          limit: parseInt(limit as string) || 20,
          offset: parseInt(offset as string) || 0
        }
      });
    } catch (error) {
      console.error('Get User Reports error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report by ID
   * GET /api/reports/:id
   */
  static async getReportById(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      // Check cache
      const cacheKey = `report:${id}`;
      const cachedReport = await getCache(cacheKey);
      
      if (cachedReport) {
        return res.status(200).json({
          success: true,
          data: cachedReport
        });
      }

      // Get report
      const report = await ReportModel.findById(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Check access
      if (report.userId !== userId) {
        return res.status(403).json({ 
          error: 'You do not have access to this report' 
        });
      }

      // Cache report
      await setCache(cacheKey, report, 600);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error) {
      console.error('Get Report error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Update report
   * PUT /api/reports/:id
   */
  static async updateReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const updates = req.body;

      // Check if report exists
      const existingReport = await ReportModel.findById(id);
      
      if (!existingReport) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Check access
      if (existingReport.userId !== userId) {
        return res.status(403).json({ 
          error: 'You do not have access to this report' 
        });
      }

      // Update report
      const updatedReport = await ReportModel.updateReport(id, updates);

      // Clear cache
      await deleteCache(`report:${id}`);
      await deleteCache(`reports:user:${userId}`);

      res.status(200).json({
        success: true,
        message: 'Report updated successfully',
        data: updatedReport
      });
    } catch (error) {
      console.error('Update Report error:', error);
      res.status(500).json({ 
        error: 'Failed to update report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete report
   * DELETE /api/reports/:id
   */
  static async deleteReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      // Check if report exists
      const report = await ReportModel.findById(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Check access
      if (report.userId !== userId) {
        return res.status(403).json({ 
          error: 'You do not have access to this report' 
        });
      }

      // Delete report
      await ReportModel.deleteReport(id);

      // Clear cache
      await deleteCache(`report:${id}`);
      await deleteCache(`reports:user:${userId}`);

      res.status(200).json({
        success: true,
        message: 'Report deleted successfully'
      });
    } catch (error) {
      console.error('Delete Report error:', error);
      res.status(500).json({ 
        error: 'Failed to delete report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Download report in specified format
   * GET /api/reports/:id/download
   */
  static async downloadReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { format } = req.query;

      // Get report
      const report = await ReportModel.findById(id);
      
      if (!report) {
        return res.status(404).json({ error: 'Report not found' });
      }

      // Check access
      if (report.userId !== userId) {
        return res.status(403).json({ 
          error: 'You do not have access to this report' 
        });
      }

      // Generate export based on format
      const exportFormat = format || 'pdf';
      let exportData;

      switch (exportFormat) {
        case 'pdf':
          exportData = await PDFService.generatePDF(report);
          res.setHeader('Content-Type', 'application/pdf');
          res.setHeader('Content-Disposition', `attachment; filename="${report.name}.pdf"`);
          break;
        case 'csv':
          exportData = await PDFService.generateCSV(report);
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', `attachment; filename="${report.name}.csv"`);
          break;
        case 'json':
          exportData = await PDFService.generateJSON(report);
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', `attachment; filename="${report.name}.json"`);
          break;
        case 'xlsx':
          exportData = await PDFService.generateExcel(report);
          res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
          res.setHeader('Content-Disposition', `attachment; filename="${report.name}.xlsx"`);
          break;
        default:
          return res.status(400).json({ error: 'Unsupported format' });
      }

      res.send(exportData);
    } catch (error) {
      console.error('Download Report error:', error);
      res.status(500).json({ 
        error: 'Failed to download report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Generate a report from template
   * POST /api/reports/generate
   */
  static async generateReportFromTemplate(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        templateId, 
        dashboardId, 
        metrics, 
        dateRange,
        includeCharts,
        includeSummary,
        includeRecommendations 
      } = req.body;

      if (!templateId) {
        return res.status(400).json({ 
          error: 'Template ID is required' 
        });
      }

      // Get dashboard metrics
      let dashboardMetrics = [];
      let dashboard = null;

      if (dashboardId) {
        dashboard = await DashboardModel.findById(dashboardId);
        if (!dashboard || dashboard.userId !== userId) {
          return res.status(403).json({ 
            error: 'You do not have access to this dashboard' 
          });
        }
        dashboardMetrics = await MetricModel.findByDashboard(dashboardId);
      } else if (metrics && metrics.length > 0) {
        // Get specific metrics
        dashboardMetrics = await Promise.all(
          metrics.map(async (id: string) => {
            const metric = await MetricModel.findById(id);
            if (!metric || metric.userId !== userId) {
              throw new Error(`Metric ${id} not found or access denied`);
            }
            return metric;
          })
        );
      } else {
        // Get all user metrics
        dashboardMetrics = await MetricModel.findByUser(userId);
      }

      if (!dashboardMetrics || dashboardMetrics.length === 0) {
        return res.status(404).json({ 
          error: 'No metrics found to generate report' 
        });
      }

      // Generate report from template
      const reportData = await this.generateFromTemplate({
        templateId,
        dashboard,
        metrics: dashboardMetrics,
        dateRange: dateRange || { start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), end: new Date() },
        includeCharts: includeCharts || true,
        includeSummary: includeSummary || true,
        includeRecommendations: includeRecommendations || true,
        userId
      });

      // Create report
      const report = await ReportModel.createReport({
        name: `Report from Template ${templateId}`,
        description: `Generated from template ${templateId}`,
        type: 'generated',
        data: reportData,
        userId
      });

      res.status(201).json({
        success: true,
        message: 'Report generated successfully',
        data: {
          report,
          reportData
        }
      });
    } catch (error) {
      console.error('Generate Report error:', error);
      res.status(500).json({ 
        error: 'Failed to generate report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report templates
   * GET /api/reports/templates
   */
  static async getReportTemplates(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const templates = [
        {
          id: 'sales_summary',
          name: 'Sales Summary Report',
          description: 'Comprehensive sales overview with trends and forecasts',
          type: 'sales',
          sections: [
            'Executive Summary',
            'Sales Performance',
            'Revenue Analysis',
            'Forecast',
            'Recommendations'
          ]
        },
        {
          id: 'performance_dashboard',
          name: 'Performance Dashboard',
          description: 'Key performance indicators and metrics',
          type: 'performance',
          sections: [
            'KPI Overview',
            'Performance Metrics',
            'Trends',
            'Insights'
          ]
        },
        {
          id: 'detailed_analysis',
          name: 'Detailed Analysis Report',
          description: 'In-depth analysis with drill-down capabilities',
          type: 'analytics',
          sections: [
            'Executive Summary',
            'Data Analysis',
            'Charts and Visualizations',
            'Key Findings',
            'Recommendations',
            'Appendix'
          ]
        },
        {
          id: 'monthly_review',
          name: 'Monthly Review',
          description: 'Monthly performance review and analysis',
          type: 'monthly',
          sections: [
            'Executive Summary',
            'Monthly Performance',
            'Comparison',
            'Goals and Achievements',
            'Action Items'
          ]
        },
        {
          id: 'forecast_report',
          name: 'Forecast Report',
          description: 'Predictive analysis and forecasting',
          type: 'forecast',
          sections: [
            'Executive Summary',
            'Current Trends',
            'Predictions',
            'Risk Analysis',
            'Recommendations'
          ]
        }
      ];

      res.status(200).json({
        success: true,
        data: templates
      });
    } catch (error) {
      console.error('Get Templates error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch templates',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Schedule report generation
   * POST /api/reports/schedule
   */
  static async scheduleReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        name,
        frequency,
        dayOfWeek,
        dayOfMonth,
        time,
        recipients,
        templateId,
        dashboardId,
        format 
      } = req.body;

      if (!name || !frequency || !templateId) {
        return res.status(400).json({ 
          error: 'Name, frequency, and template ID are required' 
        });
      }

      // Validate frequency
      const validFrequencies = ['daily', 'weekly', 'monthly'];
      if (!validFrequencies.includes(frequency)) {
        return res.status(400).json({ 
          error: 'Invalid frequency. Must be daily, weekly, or monthly' 
        });
      }

      // Create scheduled report
      const scheduledReport = {
        id: 'schedule_' + Date.now(),
        name,
        frequency,
        dayOfWeek: dayOfWeek || 1,
        dayOfMonth: dayOfMonth || 1,
        time: time || '09:00',
        recipients: recipients || [],
        templateId,
        dashboardId: dashboardId || null,
        format: format || 'pdf',
        userId,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      // In production, save to database and set up cron job

      res.status(201).json({
        success: true,
        message: 'Report scheduled successfully',
        data: scheduledReport
      });
    } catch (error) {
      console.error('Schedule Report error:', error);
      res.status(500).json({ 
        error: 'Failed to schedule report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get scheduled reports
   * GET /api/reports/scheduled
   */
  static async getScheduledReports(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      // Mock scheduled reports
      const scheduledReports = [
        {
          id: 'schedule_1',
          name: 'Weekly Sales Report',
          frequency: 'weekly',
          dayOfWeek: 1,
          time: '09:00',
          recipients: ['team@example.com'],
          templateId: 'sales_summary',
          status: 'active',
          nextRun: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          id: 'schedule_2',
          name: 'Monthly Performance Review',
          frequency: 'monthly',
          dayOfMonth: 1,
          time: '10:00',
          recipients: ['management@example.com'],
          templateId: 'detailed_analysis',
          status: 'active',
          nextRun: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      res.status(200).json({
        success: true,
        data: scheduledReports
      });
    } catch (error) {
      console.error('Get Scheduled Reports error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch scheduled reports',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete scheduled report
   * DELETE /api/reports/scheduled/:id
   */
  static async deleteScheduledReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      // In production, delete from database and remove cron job
      console.log(`Deleting scheduled report ${id} for user ${userId}`);

      res.status(200).json({
        success: true,
        message: 'Scheduled report deleted successfully'
      });
    } catch (error) {
      console.error('Delete Scheduled Report error:', error);
      res.status(500).json({ 
        error: 'Failed to delete scheduled report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export report in multiple formats
   * POST /api/reports/export
   */
  static async exportReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        reportId, 
        format, 
        includeCharts,
        includeData,
        customOptions 
      } = req.body;

      if (!reportId) {
        return res.status(400).json({ error: 'Report ID is required' });
      }

      // Get report
      const report = await ReportModel.findById(reportId);
      if (!report || report.userId !== userId) {
        return res.status(403).json({ error: 'Report not found or access denied' });
      }

      // Export options
      const options = {
        format: format || 'pdf',
        includeCharts: includeCharts !== undefined ? includeCharts : true,
        includeData: includeData !== undefined ? includeData : true,
        ...customOptions
      };

      // Generate export
      const exportData = await PDFService.exportReport(report, options);

      res.status(200).json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Export Report error:', error);
      res.status(500).json({ 
        error: 'Failed to export report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Share report with another user
   * POST /api/reports/:id/share
   */
  static async shareReport(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;
      const { shareWith, permissions, expiresAt } = req.body;

      if (!shareWith) {
        return res.status(400).json({ error: 'User to share with is required' });
      }

      // Check if report exists
      const report = await ReportModel.findById(id);
      if (!report || report.userId !== userId) {
        return res.status(403).json({ error: 'Report not found or access denied' });
      }

      // In production, save share information to database
      const shareInfo = {
        reportId: id,
        sharedBy: userId,
        sharedWith: shareWith,
        permissions: permissions || ['view'],
        expiresAt: expiresAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        createdAt: new Date().toISOString()
      };

      res.status(200).json({
        success: true,
        message: 'Report shared successfully',
        data: shareInfo
      });
    } catch (error) {
      console.error('Share Report error:', error);
      res.status(500).json({ 
        error: 'Failed to share report',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get report analytics
   * GET /api/reports/:id/analytics
   */
  static async getReportAnalytics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      // Check if report exists
      const report = await ReportModel.findById(id);
      if (!report || report.userId !== userId) {
        return res.status(403).json({ error: 'Report not found or access denied' });
      }

      // Generate analytics
      const analytics = {
        id: report.id,
        name: report.name,
        type: report.type,
        created: report.createdAt,
        size: JSON.stringify(report.data).length,
        views: 0,
        downloads: 0,
        shares: 0,
        lastAccessed: report.updatedAt || report.createdAt,
        metrics: (report.data as any)?.metrics ? (report.data as any).metrics.length : 0,
        charts: (report.data as any)?.charts ? (report.data as any).charts.length : 0
      };

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Get Report Analytics error:', error);
      res.status(500).json({ 
        error: 'Failed to fetch report analytics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Helper method to generate report data
   */
  private static async generateReportData(params: any): Promise<any> {
    const { userId, dashboardId, metrics, type, dateRange } = params;

    let reportMetrics = metrics;

    if (!reportMetrics && dashboardId) {
      reportMetrics = await MetricModel.findByDashboard(dashboardId);
    } else if (!reportMetrics) {
      reportMetrics = await MetricModel.findByUser(userId);
    }

    // Filter metrics by date range
    if (dateRange && dateRange.start && dateRange.end) {
      reportMetrics = reportMetrics.filter((metric: any) => {
        const metricDate = new Date(metric.date);
        return metricDate >= new Date(dateRange.start) && metricDate <= new Date(dateRange.end);
      });
    }

    // Generate different report types
    switch (type) {
      case 'summary':
        return this.generateSummaryReport(reportMetrics);
      case 'detailed':
        return this.generateDetailedReport(reportMetrics);
      case 'analytics':
        return this.generateAnalyticsReport(reportMetrics);
      case 'forecast':
        return this.generateForecastReport(reportMetrics);
      default:
        return this.generateSummaryReport(reportMetrics);
    }
  }

  /**
   * Generate summary report
   */
  private static generateSummaryReport(metrics: any[]): any {
    const totalValue = metrics.reduce((sum, m) => sum + m.value, 0);
    const avgValue = metrics.length > 0 ? totalValue / metrics.length : 0;
    const categories = [...new Set(metrics.map(m => m.category))];
    const categoryValues = categories.map(category => ({
      category,
      count: metrics.filter(m => m.category === category).length,
      total: metrics.filter(m => m.category === category).reduce((sum, m) => sum + m.value, 0)
    }));

    return {
      title: 'Summary Report',
      generated: new Date().toISOString(),
      metrics: metrics.map(m => ({
        id: m.id,
        name: m.name,
        value: m.value,
        category: m.category,
        date: m.date
      })),
      summary: {
        totalMetrics: metrics.length,
        totalValue,
        averageValue: avgValue,
        categories,
        categoryValues
      },
      insights: [
        `Total value of all metrics: ${totalValue.toFixed(2)}`,
        `Average metric value: ${avgValue.toFixed(2)}`,
        `Most common category: ${categories.length > 0 ? categories[0] : 'N/A'}`,
        `Total categories: ${categories.length}`
      ],
      recommendations: [
        'Consider focusing on top performing categories',
        'Review metrics with below average performance'
      ]
    };
  }

  /**
   * Generate detailed report
   */
  private static generateDetailedReport(metrics: any[]): any {
    const report = this.generateSummaryReport(metrics);
    return {
      ...report,
      title: 'Detailed Report',
      details: {
        metrics: metrics.map(m => ({
          ...m,
          trend: m.value > 0 ? 'positive' : 'negative',
          performance: m.value > 100 ? 'excellent' : m.value > 50 ? 'good' : 'needs improvement'
        })),
        statistics: {
          min: metrics.length > 0 ? Math.min(...metrics.map(m => m.value)) : 0,
          max: metrics.length > 0 ? Math.max(...metrics.map(m => m.value)) : 0,
          median: this.calculateMedian(metrics.map(m => m.value)),
          standardDeviation: this.calculateStandardDeviation(metrics.map(m => m.value))
        },
        distribution: this.calculateDistribution(metrics)
      }
    };
  }

  /**
   * Generate analytics report
   */
  private static generateAnalyticsReport(metrics: any[]): any {
    const report = this.generateDetailedReport(metrics);
    return {
      ...report,
      title: 'Analytics Report',
      analytics: {
        performance: {
          excellent: metrics.filter(m => m.value > 100).length,
          good: metrics.filter(m => m.value > 50 && m.value <= 100).length,
          needsImprovement: metrics.filter(m => m.value <= 50).length
        },
        categories: this.analyzeCategories(metrics),
        trends: this.analyzeTrends(metrics),
        anomalies: this.detectAnomalies(metrics)
      }
    };
  }

  /**
   * Generate forecast report
   */
  private static generateForecastReport(metrics: any[]): any {
    const report = this.generateAnalyticsReport(metrics);
    return {
      ...report,
      title: 'Forecast Report',
      forecast: {
        predictions: this.generatePredictions(metrics),
        confidence: 0.85,
        timeHorizon: 30,
        riskFactors: this.identifyRiskFactors(metrics),
        recommendations: this.generateForecastRecommendations(metrics)
      }
    };
  }

  /**
   * Generate report from template
   */
  private static async generateFromTemplate(params: any): Promise<any> {
    const { templateId, dashboard, metrics, dateRange, includeCharts, includeSummary, includeRecommendations } = params;

    const baseData = {
      title: `Report from Template: ${templateId}`,
      generated: new Date().toISOString(),
      dateRange: {
        start: dateRange.start.toISOString(),
        end: dateRange.end.toISOString()
      },
      dashboard: dashboard ? {
        id: dashboard.id,
        name: dashboard.name,
        description: dashboard.description
      } : null,
      metrics: metrics.map((m: any) => ({
        id: m.id,
        name: m.name,
        value: m.value,
        category: m.category,
        unit: m.unit,
        date: m.date
      }))
    };

    const sections: Record<string, any> = {};

    if (includeSummary) {
      sections['summary'] = {
        totalMetrics: metrics.length,
        totalValue: metrics.reduce((sum: number, m: any) => sum + m.value, 0),
        averageValue: metrics.reduce((sum: number, m: any) => sum + m.value, 0) / metrics.length,
        categories: [...new Set(metrics.map((m: any) => m.category))]
      };
    }

    if (includeCharts) {
      sections['charts'] = {
        distribution: this.generateChartData(metrics),
        trends: this.generateTrendData(metrics),
        comparison: this.generateComparisonData(metrics)
      };
    }

    if (includeRecommendations) {
      sections['recommendations'] = [
        'Focus on improving low-performing metrics',
        'Maintain and enhance top-performing areas',
        'Consider reallocating resources to high-potential categories'
      ];
    }

    return {
      ...baseData,
      sections
    };
  }

  /**
   * Helper statistical methods
   */
  private static calculateMedian(values: number[]): number {
    if (values.length === 0) return 0;
    const sorted = [...values].sort((a, b) => a - b);
    const middle = Math.floor(sorted.length / 2);
    if (sorted.length % 2 === 0) {
      return (sorted[middle - 1] + sorted[middle]) / 2;
    }
    return sorted[middle];
  }

  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private static calculateDistribution(metrics: any[]): any {
    const distribution: Record<string, any> = {};
    metrics.forEach(m => {
      if (!distribution[m.category]) {
        distribution[m.category] = [];
      }
      distribution[m.category].push(m.value);
    });
    return distribution;
  }

  private static analyzeCategories(metrics: any[]): any {
    const categories: Record<string, any> = {};
    metrics.forEach(m => {
      if (!categories[m.category]) {
        categories[m.category] = {
          count: 0,
          total: 0,
          average: 0,
          min: Infinity,
          max: -Infinity
        };
      }
      const cat = categories[m.category];
      cat.count++;
      cat.total += m.value;
      cat.min = Math.min(cat.min, m.value);
      cat.max = Math.max(cat.max, m.value);
      cat.average = cat.total / cat.count;
    });
    return categories;
  }

  private static analyzeTrends(metrics: any[]): any {
    const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      direction: sorted.length > 1 ? (sorted[sorted.length - 1].value > sorted[0].value ? 'upward' : 'downward') : 'stable',
      change: sorted.length > 1 ? ((sorted[sorted.length - 1].value - sorted[0].value) / sorted[0].value) * 100 : 0,
      volatility: sorted.length > 1 ? this.calculateStandardDeviation(sorted.map(m => m.value)) / sorted.reduce((a, b) => a + b.value, 0) / sorted.length : 0
    };
  }

  private static detectAnomalies(metrics: any[]): any[] {
    const anomalies: any[] = [];
    const mean = metrics.reduce((a, b) => a + b.value, 0) / metrics.length;
    const stdDev = this.calculateStandardDeviation(metrics.map(m => m.value));
    const threshold = 2;

    metrics.forEach(m => {
      const zScore = Math.abs((m.value - mean) / stdDev);
      if (zScore > threshold) {
        anomalies.push({
          metric: m.name,
          value: m.value,
          zScore,
          reason: `Value deviates ${zScore.toFixed(2)} standard deviations from mean`
        });
      }
    });

    return anomalies;
  }

  private static generatePredictions(metrics: any[]): any {
    const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const values = sorted.map(m => m.value);
    const growth = values.length > 1 ? (values[values.length - 1] - values[0]) / values[0] : 0;

    return {
      nextMonth: values[values.length - 1] * (1 + growth),
      nextQuarter: values[values.length - 1] * (1 + growth * 3),
      nextYear: values[values.length - 1] * (1 + growth * 12),
      growthRate: growth * 100,
      confidence: 0.85
    };
  }

  private static identifyRiskFactors(metrics: any[]): any[] {
    const risks = [];
    const highRiskMetrics = metrics.filter(m => m.value < 50);
    const volatileMetrics = metrics.filter(m => {
      const values = metrics.filter(mm => mm.category === m.category).map(mm => mm.value);
      return values.length > 1 && this.calculateStandardDeviation(values) / values.reduce((a, b) => a + b, 0) / values.length > 0.3;
    });

    if (highRiskMetrics.length > 0) {
      risks.push({
        type: 'low_performance',
        severity: 'high',
        metrics: highRiskMetrics.map(m => m.name),
        recommendation: 'Focus on improving low-performing metrics'
      });
    }

    if (volatileMetrics.length > 0) {
      risks.push({
        type: 'high_volatility',
        severity: 'medium',
        metrics: volatileMetrics.map(m => m.name),
        recommendation: 'Implement strategies to stabilize volatile metrics'
      });
    }

    return risks;
  }

  private static generateForecastRecommendations(metrics: any[]): any[] {
    const recommendations = [];
    const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const values = sorted.map(m => m.value);
    const trend = values.length > 1 ? values[values.length - 1] - values[0] : 0;

    if (trend > 0) {
      recommendations.push('Positive trend detected. Continue current growth strategies.');
    } else if (trend < 0) {
      recommendations.push('Negative trend detected. Review and adjust strategies.');
    }

    // Category-based recommendations
    const categories = [...new Set(metrics.map(m => m.category))];
    categories.forEach(category => {
      const categoryMetrics = metrics.filter(m => m.category === category);
      const avgValue = categoryMetrics.reduce((a, b) => a + b.value, 0) / categoryMetrics.length;
      if (avgValue > 100) {
        recommendations.push(`${category}: Strong performance. Maintain focus.`);
      } else if (avgValue < 50) {
        recommendations.push(`${category}: Needs improvement. Consider intervention.`);
      }
    });

    return recommendations;
  }

  private static generateChartData(metrics: any[]): any {
    const categories = [...new Set(metrics.map(m => m.category))];
    return categories.map(category => ({
      category,
      values: metrics.filter(m => m.category === category).map(m => m.value),
      average: metrics.filter(m => m.category === category).reduce((a, b) => a + b.value, 0) / metrics.filter(m => m.category === category).length
    }));
  }

  private static generateTrendData(metrics: any[]): any {
    const sorted = [...metrics].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    return {
      dates: sorted.map(m => m.date),
      values: sorted.map(m => m.value),
      labels: sorted.map(m => m.name)
    };
  }

  private static generateComparisonData(metrics: any[]): any {
    const categories = [...new Set(metrics.map(m => m.category))];
    return categories.map(category => ({
      category,
      total: metrics.filter(m => m.category === category).reduce((a, b) => a + b.value, 0),
      average: metrics.filter(m => m.category === category).reduce((a, b) => a + b.value, 0) / metrics.filter(m => m.category === category).length,
      count: metrics.filter(m => m.category === category).length
    }));
  }
}