import { Request, Response } from 'express';
import { NLPService } from '../services/nlpService';
import { MetricModel } from '../models/MetricModel';
import { DashboardModel } from '../models/DashboardModel';
import { setCache, getCache } from '../config/redis';

// Define Metric interface matching Prisma model
interface Metric {
  id: string;
  name: string;
  value: number;
  unit?: string | null;
  category: string;
  date: Date;
  dashboardId: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export class NLPController {
  /**
   * Process natural language query
   * POST /api/nlp/query
   */
  static async processNaturalLanguageQuery(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { query } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Query is required' });
      }

      const metrics = await MetricModel.findByUser(userId);
      
      // Convert metrics to proper type
      const typedMetrics: Metric[] = metrics.map((m: any) => ({
        ...m,
        unit: m.unit || undefined,
      }));

      const result = await NLPService.processQuery(query, typedMetrics);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error) {
      console.error('NLP Query error:', error);
      res.status(500).json({ 
        error: 'Failed to process query',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Analyze data
   * POST /api/nlp/analyze
   */
  static async analyzeData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { data, analysisType } = req.body;

      let metricsData = data;
      if (!data) {
        const metrics = await MetricModel.findByUser(userId);
        metricsData = metrics.map((m: any) => ({
          ...m,
          unit: m.unit || undefined,
        }));
      }

      const analysis = await NLPService.analyzeData(metricsData, {
        analysisType: analysisType || 'general',
        userId,
      });

      res.status(200).json({
        success: true,
        data: analysis,
      });
    } catch (error) {
      console.error('NLP Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to analyze data',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get recommendations
   * POST /api/nlp/recommendations
   */
  static async getRecommendations(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { goal } = req.body;

      const metrics = await MetricModel.findByUser(userId);
      
      if (!metrics || metrics.length === 0) {
        return res.status(404).json({ error: 'No metrics found' });
      }

      const typedMetrics = metrics.map((m: any) => ({
        ...m,
        unit: m.unit || undefined,
      }));

      const recommendations = await NLPService.generateRecommendations(
        typedMetrics,
        goal || 'improve_performance'
      );

      res.status(200).json({
        success: true,
        data: recommendations,
      });
    } catch (error) {
      console.error('Get Recommendations error:', error);
      res.status(500).json({ 
        error: 'Failed to get recommendations',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Chat with data
   * POST /api/nlp/chat
   */
  static async chatWithData(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { message, conversationId, context } = req.body;

      if (!message) {
        return res.status(400).json({ error: 'Message is required' });
      }

      const metrics = await MetricModel.findByUser(userId);
      const dashboards = await DashboardModel.findByUser(userId);

      const typedMetrics = metrics.map((m: any) => ({
        ...m,
        unit: m.unit || undefined,
      }));

      const response = await NLPService.processChatMessage(message, {
        userId,
        metrics: typedMetrics,
        dashboards,
        conversationId: conversationId || 'new',
        context: context || {},
      });

      res.status(200).json({
        success: true,
        data: response,
      });
    } catch (error) {
      console.error('Chat error:', error);
      res.status(500).json({ 
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get query suggestions
   * GET /api/nlp/suggestions
   */
  static async getQuerySuggestions(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { category } = req.query;

      const metrics = await MetricModel.findByUser(userId);
      
      const typedMetrics = metrics.map((m: any) => ({
        ...m,
        unit: m.unit || undefined,
      }));

      const suggestions = await NLPService.generateQuerySuggestions(
        typedMetrics,
        category as string || 'all'
      );

      res.status(200).json({
        success: true,
        data: suggestions,
      });
    } catch (error) {
      console.error('Get Suggestions error:', error);
      res.status(500).json({ 
        error: 'Failed to get suggestions',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Train NLP model
   * POST /api/nlp/train
   */
  static async trainModel(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { trainingData, modelType } = req.body;

      if (!trainingData) {
        return res.status(400).json({ error: 'Training data is required' });
      }

      const result = await NLPService.trainModel(trainingData, {
        modelType: modelType || 'general',
        userId,
      });

      res.status(200).json({
        success: true,
        data: result,
        message: 'Model trained successfully',
      });
    } catch (error) {
      console.error('Train Model error:', error);
      res.status(500).json({ 
        error: 'Failed to train model',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Get model status
   * GET /api/nlp/status
   */
  static async getModelStatus(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;

      const status = await NLPService.getModelStatus(userId);

      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Get Model Status error:', error);
      res.status(500).json({ 
        error: 'Failed to get model status',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Export analysis
   * POST /api/nlp/export
   */
  static async exportAnalysis(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { format, analysisData } = req.body;

      if (!analysisData) {
        return res.status(400).json({ error: 'Analysis data is required' });
      }

      const exportedData = await NLPService.exportAnalysis(analysisData, {
        format: format || 'json',
        userId,
      });

      res.status(200).json({
        success: true,
        data: exportedData,
      });
    } catch (error) {
      console.error('Export Analysis error:', error);
      res.status(500).json({ 
        error: 'Failed to export analysis',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  /**
   * Generate insights
   * POST /api/nlp/generate-insights
   */
  static async generateInsights(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      const { dashboardId, focusArea, timeRange } = req.body;

      let metrics;
      if (dashboardId) {
        metrics = await MetricModel.findByDashboard(dashboardId);
      } else {
        metrics = await MetricModel.findByUser(userId);
      }

      if (!metrics || metrics.length === 0) {
        return res.status(404).json({ error: 'No metrics found' });
      }

      const typedMetrics = metrics.map((m: any) => ({
        ...m,
        unit: m.unit || undefined,
      }));

      const insights = await NLPService.generateInsights(typedMetrics, {
        focusArea: focusArea || 'all',
        timeRange: timeRange || 'all',
        userId,
      });

      const cacheKey = `nlp:insights:${userId}:${dashboardId || 'all'}`;
      await setCache(cacheKey, insights, 600);

      res.status(200).json({
        success: true,
        data: insights,
      });
    } catch (error) {
      console.error('Generate Insights error:', error);
      res.status(500).json({ 
        error: 'Failed to generate insights',
        details: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}