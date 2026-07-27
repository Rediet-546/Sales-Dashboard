import { Request, Response } from 'express';
import { WhatIfService } from '../services/whatIfService';
import { MetricModel } from '../models/MetricModel';
import { DashboardModel } from '../models/DashboardModel';
import { setCache, getCache, deleteCache } from '../config/redis';

export class WhatIfController {
  /**
   * Analyze a what-if scenario
   * POST /api/what-if/analyze
   */
  static async analyzeScenario(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        metricId, 
        change, 
        changeType, 
        timeFrame,
        includeRelated 
      } = req.body;

      if (!metricId && change === undefined) {
        return res.status(400).json({ 
          error: 'Metric ID and change percentage are required' 
        });
      }

      let metric;
      if (metricId) {
        metric = await MetricModel.findById(metricId);
        if (!metric) {
          return res.status(404).json({ error: 'Metric not found' });
        }
        if (metric.userId !== userId) {
          return res.status(403).json({ 
            error: 'You do not have access to this metric' 
          });
        }
      } else {
        // Get first metric if none specified
        const metrics = await MetricModel.findByUser(userId);
        if (metrics.length === 0) {
          return res.status(404).json({ 
            error: 'No metrics found for analysis' 
          });
        }
        metric = metrics[0];
      }

      // Analyze scenario
      const scenario = await WhatIfService.analyzeScenario({
        metric,
        changePercentage: change,
        changeType: changeType || 'percentage',
        timeFrame: timeFrame || 30,
        userId,
        includeRelated: includeRelated || false
      });

      // Cache scenario for quick access
      const cacheKey = `whatif:scenario:${userId}:${metricId}:${change}`;
      await setCache(cacheKey, scenario, 600); // Cache for 10 minutes

      res.status(200).json({
        success: true,
        data: scenario
      });
    } catch (error) {
      console.error('Analyze Scenario error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Predict outcomes based on changes
   * POST /api/what-if/predict
   */
  static async predictOutcome(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        metricIds, 
        changes, 
        predictionModel,
        timeHorizon,
        confidenceLevel 
      } = req.body;

      if (!metricIds || !metricIds.length) {
        return res.status(400).json({ 
          error: 'At least one metric ID is required' 
        });
      }

      // Get metrics
      const metrics = await Promise.all(
        metricIds.map(async (id: string) => {
          const metric = await MetricModel.findById(id);
          if (!metric || metric.userId !== userId) {
            throw new Error(`Metric ${id} not found or access denied`);
          }
          return metric;
        })
      );

      // Make predictions
      const predictions = await WhatIfService.predictOutcome({
        metrics,
        changes: changes || [],
        model: predictionModel || 'linear',
        timeHorizon: timeHorizon || 30,
        confidenceLevel: confidenceLevel || 0.95,
        userId
      });

      res.status(200).json({
        success: true,
        data: predictions
      });
    } catch (error) {
      console.error('Predict Outcome error:', error);
      res.status(500).json({ 
        error: 'Failed to predict outcomes',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Compare multiple scenarios
   * POST /api/what-if/compare
   */
  static async compareScenarios(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        scenarios, 
        comparisonMetrics,
        weights,
        optimizationGoal 
      } = req.body;

      if (!scenarios || !scenarios.length) {
        return res.status(400).json({ 
          error: 'At least one scenario is required' 
        });
      }

      // Validate scenarios
      const validatedScenarios = await Promise.all(
        scenarios.map(async (scenario: any) => {
          if (!scenario.metricId) {
            throw new Error('Each scenario must have a metricId');
          }
          const metric = await MetricModel.findById(scenario.metricId);
          if (!metric || metric.userId !== userId) {
            throw new Error(`Metric ${scenario.metricId} not found or access denied`);
          }
          return {
            ...scenario,
            metric
          };
        })
      );

      // Compare scenarios
      const comparison = await WhatIfService.compareScenarios({
        scenarios: validatedScenarios,
        comparisonMetrics: comparisonMetrics || ['impact', 'risk', 'feasibility'],
        weights: weights || { impact: 0.5, risk: 0.3, feasibility: 0.2 },
        optimizationGoal: optimizationGoal || 'maximize_impact',
        userId
      });

      res.status(200).json({
        success: true,
        data: comparison
      });
    } catch (error) {
      console.error('Compare Scenarios error:', error);
      res.status(500).json({ 
        error: 'Failed to compare scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Optimize metrics for best outcomes
   * POST /api/what-if/optimize
   */
  static async optimizeMetrics(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        dashboardId,
        optimizationGoal,
        constraints,
        optimizationMethod 
      } = req.body;

      // Get metrics from dashboard or user
      let metrics;
      if (dashboardId) {
        const dashboard = await DashboardModel.findById(dashboardId);
        if (!dashboard || dashboard.userId !== userId) {
          return res.status(403).json({ 
            error: 'You do not have access to this dashboard' 
          });
        }
        metrics = await MetricModel.findByDashboard(dashboardId);
      } else {
        metrics = await MetricModel.findByUser(userId);
      }

      if (!metrics || metrics.length === 0) {
        return res.status(404).json({ 
          error: 'No metrics found for optimization' 
        });
      }

      // Optimize metrics
      const optimization = await WhatIfService.optimizeMetrics({
        metrics,
        goal: optimizationGoal || 'maximize_revenue',
        constraints: constraints || {},
        method: optimizationMethod || 'gradient_descent',
        userId
      });

      // Cache optimization result
      const cacheKey = `whatif:optimization:${userId}:${dashboardId || 'all'}`;
      await setCache(cacheKey, optimization, 600);

      res.status(200).json({
        success: true,
        data: optimization
      });
    } catch (error) {
      console.error('Optimize Metrics error:', error);
      res.status(500).json({ 
        error: 'Failed to optimize metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get sensitivity analysis
   * POST /api/what-if/sensitivity
   */
  static async sensitivityAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        metricId, 
        variables,
        range,
        steps 
      } = req.body;

      if (!metricId) {
        return res.status(400).json({ 
          error: 'Metric ID is required' 
        });
      }

      const metric = await MetricModel.findById(metricId);
      if (!metric || metric.userId !== userId) {
        return res.status(403).json({ 
          error: 'You do not have access to this metric' 
        });
      }

      // Run sensitivity analysis
      const sensitivity = await WhatIfService.sensitivityAnalysis({
        metric,
        variables: variables || ['value'],
        range: range || { min: -50, max: 50 },
        steps: steps || 10,
        userId
      });

      res.status(200).json({
        success: true,
        data: sensitivity
      });
    } catch (error) {
      console.error('Sensitivity Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to perform sensitivity analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get Monte Carlo simulation
   * POST /api/what-if/monte-carlo
   */
  static async monteCarloSimulation(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        metricIds, 
        iterations,
        distribution,
        parameters 
      } = req.body;

      if (!metricIds || !metricIds.length) {
        return res.status(400).json({ 
          error: 'At least one metric ID is required' 
        });
      }

      // Get metrics
      const metrics = await Promise.all(
        metricIds.map(async (id: string) => {
          const metric = await MetricModel.findById(id);
          if (!metric || metric.userId !== userId) {
            throw new Error(`Metric ${id} not found or access denied`);
          }
          return metric;
        })
      );

      // Run Monte Carlo simulation
      const simulation = await WhatIfService.monteCarloSimulation({
        metrics,
        iterations: iterations || 10000,
        distribution: distribution || 'normal',
        parameters: parameters || {},
        userId
      });

      res.status(200).json({
        success: true,
        data: simulation
      });
    } catch (error) {
      console.error('Monte Carlo Simulation error:', error);
      res.status(500).json({ 
        error: 'Failed to run Monte Carlo simulation',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get scenario recommendations
   * POST /api/what-if/recommendations
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        goal, 
        riskTolerance,
        budget,
        timeConstraint 
      } = req.body;

      // Get user's metrics
      const metrics = await MetricModel.findByUser(userId);
      if (!metrics || metrics.length === 0) {
        return res.status(404).json({ 
          error: 'No metrics found for recommendations' 
        });
      }

      // Generate recommendations
      const recommendations = await WhatIfService.getRecommendations({
        metrics,
        goal: goal || 'improve_performance',
        riskTolerance: riskTolerance || 'medium',
        budget: budget || 'unlimited',
        timeConstraint: timeConstraint || 'unlimited',
        userId
      });

      res.status(200).json({
        success: true,
        data: recommendations
      });
    } catch (error) {
      console.error('Get Recommendations error:', error);
      res.status(500).json({ 
        error: 'Failed to get recommendations',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Save scenario for later use
   * POST /api/what-if/save
   */
  static async saveScenario(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        name, 
        description, 
        scenarioData,
        isPublic 
      } = req.body;

      if (!name || !scenarioData) {
        return res.status(400).json({ 
          error: 'Name and scenario data are required' 
        });
      }

      // Save scenario
      const savedScenario = await WhatIfService.saveScenario({
        name,
        description: description || '',
        scenarioData,
        userId,
        isPublic: isPublic || false
      });

      // Clear cache
      await deleteCache(`whatif:scenarios:${userId}`);

      res.status(201).json({
        success: true,
        data: savedScenario,
        message: 'Scenario saved successfully'
      });
    } catch (error) {
      console.error('Save Scenario error:', error);
      res.status(500).json({ 
        error: 'Failed to save scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get saved scenarios
   * GET /api/what-if/scenarios
   */
  static async getSavedScenarios(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { includePublic } = req.query;

      const cacheKey = `whatif:scenarios:${userId}`;
      const cachedScenarios = await getCache(cacheKey);
      
      if (cachedScenarios) {
        return res.status(200).json({
          success: true,
          data: cachedScenarios
        });
      }

      // Get saved scenarios
      const scenarios = await WhatIfService.getSavedScenarios({
        userId,
        includePublic: includePublic === 'true'
      });

      await setCache(cacheKey, scenarios, 300);

      res.status(200).json({
        success: true,
        data: scenarios
      });
    } catch (error) {
      console.error('Get Saved Scenarios error:', error);
      res.status(500).json({ 
        error: 'Failed to get saved scenarios',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Delete saved scenario
   * DELETE /api/what-if/scenarios/:id
   */
  static async deleteScenario(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { id } = req.params;

      // Delete scenario
      await WhatIfService.deleteScenario(id, userId);

      // Clear cache
      await deleteCache(`whatif:scenarios:${userId}`);
      await deleteCache(`whatif:scenario:${id}`);

      res.status(200).json({
        success: true,
        message: 'Scenario deleted successfully'
      });
    } catch (error) {
      console.error('Delete Scenario error:', error);
      res.status(500).json({ 
        error: 'Failed to delete scenario',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Export analysis results
   * POST /api/what-if/export
   */
  static async exportAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { 
        analysisId, 
        format,
        includeCharts 
      } = req.body;

      if (!analysisId) {
        return res.status(400).json({ 
          error: 'Analysis ID is required' 
        });
      }

      // Export analysis
      const exportData = await WhatIfService.exportAnalysis({
        analysisId,
        format: format || 'pdf',
        includeCharts: includeCharts || true,
        userId
      });

      res.status(200).json({
        success: true,
        data: exportData
      });
    } catch (error) {
      console.error('Export Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to export analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  /**
   * Get analysis history
   * GET /api/what-if/history
   */
  static async getAnalysisHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { limit, offset } = req.query;

      const history = await WhatIfService.getAnalysisHistory({
        userId,
        limit: limit ? parseInt(limit as string) : 20,
        offset: offset ? parseInt(offset as string) : 0
      });

      res.status(200).json({
        success: true,
        data: history
      });
    } catch (error) {
      console.error('Get Analysis History error:', error);
      res.status(500).json({ 
        error: 'Failed to get analysis history',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
}