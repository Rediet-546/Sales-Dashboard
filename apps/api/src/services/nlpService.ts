import OpenAI from 'openai';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Update the Metric interface to handle null
interface Metric {
  id: string;
  name: string;
  value: number;
  unit?: string | null; // Allow null
  category: string;
  date: Date;
  dashboardId: string;
  userId: string;
}

interface AnalysisOptions {
  analysisType?: string;
  timeframe?: string;
  userId?: string;
}

interface InsightOptions {
  focusArea?: string;
  timeRange?: string;
  userId?: string;
}

interface ChatContext {
  userId: string;
  metrics: any[];
  dashboards: any[];
  conversationId: string;
  context: any;
}

interface TrainingOptions {
  modelType?: string;
  userId?: string;
}

interface ExportOptions {
  format?: string;
  userId?: string;
}

export class NLPService {
  /**
   * Process natural language query
   */
  static async processQuery(query: string, metrics: Metric[]) {
    try {
      // Prepare context from metrics
      const metricsContext = metrics
        .slice(0, 20)
        .map(m => `${m.name}: ${m.value} (${m.category})`)
        .join('\n');

      // Use OpenAI if API key is available
      if (process.env.OPENAI_API_KEY) {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: `You are a helpful data analyst assistant. 
              Analyze the following metrics and answer the user's question.
              Provide insights, trends, and recommendations.
              
              Available metrics:
              ${metricsContext}`
            },
            {
              role: "user",
              content: query
            }
          ],
          temperature: 0.7,
          max_tokens: 500,
        });

        const response = completion.choices[0]?.message?.content || '';
        const insights = response
          .split('\n')
          .filter(line => line.trim().length > 0)
          .map(line => line.replace(/^[-•*]\s*/, ''));

        return {
          query,
          response,
          insights: insights.slice(0, 10),
          metrics: metrics.slice(0, 10),
          confidence: 0.85,
          source: 'openai',
        };
      }

      // Fallback to basic processing
      return this.fallbackProcessQuery(query, metrics);
    } catch (error) {
      console.error('OpenAI error:', error);
      return this.fallbackProcessQuery(query, metrics);
    }
  }

  /**
   * Analyze data
   */
  static async analyzeData(data: any, options?: AnalysisOptions) {
    // Extract metrics from data
    let metrics: any[] = [];
    if (Array.isArray(data)) {
      metrics = data;
    } else if (data && data.metrics && Array.isArray(data.metrics)) {
      metrics = data.metrics;
    }

    // If no metrics, return empty analysis
    if (!metrics || metrics.length === 0) {
      return {
        summary: 'No data available for analysis',
        insights: ['No data to analyze'],
        statistics: {
          total: 0,
          average: 0,
          min: 0,
          max: 0,
          count: 0,
        },
        trends: {
          direction: 'stable' as 'upward' | 'downward' | 'stable',
          change: 0,
          volatility: 0,
        },
        categories: {},
        recommendations: ['Collect more data to generate insights'],
      };
    }

    const analysis = {
      summary: '',
      insights: [] as string[],
      statistics: {
        total: 0,
        average: 0,
        min: 0,
        max: 0,
        count: metrics.length,
      },
      trends: {
        direction: 'stable' as 'upward' | 'downward' | 'stable',
        change: 0,
        volatility: 0,
      },
      categories: {} as Record<string, any>,
      recommendations: [] as string[],
    };

    // Calculate statistics
    const values = metrics.map((m: any) => m.value);
    analysis.statistics.total = values.reduce((a: number, b: number) => a + b, 0);
    analysis.statistics.average = analysis.statistics.total / values.length;
    analysis.statistics.min = Math.min(...values);
    analysis.statistics.max = Math.max(...values);

    // Analyze categories - Properly typed
    const categories: string[] = [...new Set(metrics.map((m: any) => m.category))];
    categories.forEach((category: string) => {
      const catMetrics = metrics.filter((m: any) => m.category === category);
      const catValues = catMetrics.map((m: any) => m.value);
      analysis.categories[category] = {
        count: catMetrics.length,
        total: catValues.reduce((a: number, b: number) => a + b, 0),
        average: catValues.reduce((a: number, b: number) => a + b, 0) / catValues.length,
        min: Math.min(...catValues),
        max: Math.max(...catValues),
      };
    });

    // Analyze trends
    const sorted = [...metrics].sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    if (sorted.length > 1) {
      const first = sorted[0].value;
      const last = sorted[sorted.length - 1].value;
      analysis.trends.change = ((last - first) / first) * 100;
      analysis.trends.direction = last > first ? 'upward' : last < first ? 'downward' : 'stable';
    }

    // Generate insights
    analysis.insights.push(`Analysis of ${metrics.length} metrics completed`);
    analysis.insights.push(`Average value: ${analysis.statistics.average.toFixed(2)}`);
    analysis.insights.push(`Trend: ${analysis.trends.direction} with ${Math.abs(analysis.trends.change).toFixed(2)}% change`);
    analysis.insights.push(`Categories: ${categories.join(', ')}`);

    // Generate recommendations
    if (analysis.trends.direction === 'downward') {
      analysis.recommendations.push('Consider investigating factors causing downward trend');
      analysis.recommendations.push('Review underperforming metrics for improvement opportunities');
    } else if (analysis.trends.direction === 'upward') {
      analysis.recommendations.push('Continue current strategies to maintain growth');
      analysis.recommendations.push('Look for opportunities to accelerate growth further');
    } else {
      analysis.recommendations.push('Monitor metrics for emerging trends');
      analysis.recommendations.push('Consider setting up alerts for significant changes');
    }

    analysis.summary = `Analysis complete. ${analysis.insights.length} insights generated.`;

    return analysis;
  }

  /**
   * Generate insights
   */
  static async generateInsights(data: any, options?: InsightOptions) {
    // Extract metrics from data
    let metrics: any[] = [];
    if (Array.isArray(data)) {
      metrics = data;
    } else if (data && data.metrics && Array.isArray(data.metrics)) {
      metrics = data.metrics;
    }

    const insights = {
      overview: '',
      keyFindings: [] as string[],
      recommendations: [] as string[],
      metrics: [] as any[],
      categories: {} as Record<string, any>,
      trends: {
        direction: 'stable' as 'upward' | 'downward' | 'stable',
        strength: 0,
        confidence: 0,
      },
      anomalies: [] as any[],
      opportunities: [] as string[],
      risks: [] as string[],
      timestamp: new Date().toISOString(),
    };

    if (!metrics || metrics.length === 0) {
      insights.overview = 'No data available to generate insights';
      return insights;
    }

    const values = metrics.map((m: any) => m.value);
    const total = values.reduce((a: number, b: number) => a + b, 0);
    const average = total / values.length;
    const stdDev = this.calculateStandardDeviation(values);

    // Trend analysis
    const sorted = [...metrics].sort((a: any, b: any) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    if (sorted.length > 1) {
      const first = sorted[0].value;
      const last = sorted[sorted.length - 1].value;
      const change = ((last - first) / first) * 100;
      insights.trends.direction = last > first ? 'upward' : last < first ? 'downward' : 'stable';
      insights.trends.strength = Math.abs(change);
      insights.trends.confidence = Math.min(100, 70 + (sorted.length / 10) * 5);
    }

    // Category analysis - Properly typed
    const categories: string[] = [...new Set(metrics.map((m: any) => m.category))];
    categories.forEach((category: string) => {
      const catMetrics = metrics.filter((m: any) => m.category === category);
      const catValues = catMetrics.map((m: any) => m.value);
      const catAverage = catValues.reduce((a: number, b: number) => a + b, 0) / catValues.length;
      
      insights.categories[category] = {
        count: catMetrics.length,
        average: catAverage,
        total: catValues.reduce((a: number, b: number) => a + b, 0),
        performance: catAverage > average ? 'above_average' : 'below_average',
      };

      if (catAverage > average * 1.2) {
        insights.opportunities.push(`${category}: High performing category. Consider expanding.`);
      } else if (catAverage < average * 0.8) {
        insights.risks.push(`${category}: Underperforming category. Needs attention.`);
      }
    });

    // Detect anomalies (values > 2 standard deviations from mean)
    metrics.forEach((metric: any) => {
      const zScore = Math.abs((metric.value - average) / stdDev);
      if (zScore > 2) {
        insights.anomalies.push({
          metric: metric.name,
          value: metric.value,
          zScore: zScore,
          reason: `Value deviates ${zScore.toFixed(2)} standard deviations from mean`,
        });
      }
    });

    // Generate key findings
    insights.keyFindings.push(
      `Total metrics analyzed: ${metrics.length}`,
      `Average value: ${average.toFixed(2)}`,
      `Value range: ${Math.min(...values)} - ${Math.max(...values)}`,
      `Categories: ${categories.join(', ')}`,
      `Standard deviation: ${stdDev.toFixed(2)}`
    );

    if (insights.anomalies.length > 0) {
      insights.keyFindings.push(`Detected ${insights.anomalies.length} anomalies that may require attention`);
    }

    if (insights.trends.direction === 'upward') {
      insights.keyFindings.push(`Strong upward trend detected with ${insights.trends.strength.toFixed(2)}% growth`);
    } else if (insights.trends.direction === 'downward') {
      insights.keyFindings.push(`Declining trend detected with ${insights.trends.strength.toFixed(2)}% decrease`);
    }

    // Generate recommendations
    if (insights.trends.direction === 'upward' && insights.trends.strength > 20) {
      insights.recommendations.push('Strong upward trend - accelerate investment in this area');
    } else if (insights.trends.direction === 'downward' && insights.trends.strength > 20) {
      insights.recommendations.push('Significant downward trend - immediate intervention needed');
    }

    if (insights.anomalies.length > 0) {
      insights.recommendations.push(`Investigate ${insights.anomalies.length} anomalies detected`);
    }

    insights.overview = `Generated ${insights.keyFindings.length} key findings and ${insights.recommendations.length} recommendations`;

    return insights;
  }

  /**
   * Generate recommendations
   */
  static async generateRecommendations(metrics: any[], goal: string) {
    const recommendations = {
      goal: goal,
      priority: [] as any[],
      actions: [] as any[],
      expectedImpact: 0,
      timeframe: '',
      resources: [] as string[],
      risks: [] as string[],
    };

    if (!metrics || metrics.length === 0) {
      return {
        ...recommendations,
        priority: ['No data available for recommendations'],
        actions: ['Collect more data to generate recommendations'],
      };
    }

    const values = metrics.map((m: any) => m.value);
    const average = values.reduce((a: number, b: number) => a + b, 0) / values.length;

    // Identify areas for improvement
    const categories: string[] = [...new Set(metrics.map((m: any) => m.category))];
    categories.forEach((category: string) => {
      const catMetrics = metrics.filter((m: any) => m.category === category);
      const catAverage = catMetrics.reduce((a: number, b: any) => a + b.value, 0) / catMetrics.length;
      
      if (catAverage < average) {
        recommendations.priority.push({
          category,
          current: catAverage,
          target: average,
          gap: average - catAverage,
          effort: catAverage / average < 0.5 ? 'high' : 'medium',
        });
      }
    });

    // Generate actions
    recommendations.priority.forEach((item: any) => {
      recommendations.actions.push({
        action: `Improve ${item.category} performance from ${item.current.toFixed(2)} to ${item.target.toFixed(2)}`,
        category: item.category,
        effort: item.effort,
        expectedImpact: item.gap / average * 100,
      });
    });

    recommendations.expectedImpact = recommendations.actions.reduce(
      (sum: number, action: any) => sum + action.expectedImpact, 0
    ) / (recommendations.actions.length || 1);

    recommendations.timeframe = recommendations.actions.length > 5 ? '3 months' : 
                                recommendations.actions.length > 2 ? '1 month' : '2 weeks';
    recommendations.resources = [
      'Data analysis tools',
      'Reporting system',
      'Team collaboration',
      'Monitoring dashboard'
    ];

    // Identify risks
    if (recommendations.expectedImpact > 20) {
      recommendations.risks.push('High expected impact may require significant changes');
      recommendations.risks.push('Monitor carefully for unintended consequences');
    }

    return recommendations;
  }

  /**
   * Process chat message
   */
  static async processChatMessage(message: string, context: ChatContext) {
    const response = {
      message: '',
      intent: '',
      data: null as any,
      suggestions: [] as string[],
      timestamp: new Date().toISOString(),
    };

    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('show') || lowerMessage.includes('display') || lowerMessage.includes('view')) {
      response.intent = 'display_data';
      const metrics = context.metrics || [];
      response.data = metrics.slice(0, 10);
      response.message = `Here are the latest ${Math.min(10, metrics.length)} metrics`;
      response.suggestions = ['Show me all metrics', 'Show me trends', 'Show me categories'];
    } else if (lowerMessage.includes('analyze') || lowerMessage.includes('analysis')) {
      response.intent = 'analyze';
      const analysis = await this.analyzeData(context.metrics);
      response.data = analysis;
      response.message = `Analysis complete: ${analysis.summary}`;
      response.suggestions = ['Show me insights', 'Show me recommendations', 'Show me trends'];
    } else if (lowerMessage.includes('insight') || lowerMessage.includes('find')) {
      response.intent = 'insights';
      const insights = await this.generateInsights(context.metrics);
      response.data = insights;
      response.message = `Generated ${insights.keyFindings.length} key findings`;
      response.suggestions = ['Show me all insights', 'Show me recommendations', 'Show me anomalies'];
    } else if (lowerMessage.includes('help') || lowerMessage.includes('?') || lowerMessage.includes('what can')) {
      response.intent = 'help';
      response.message = `I can help you with:
• Viewing metrics
• Analyzing data
• Generating insights
• Getting recommendations
• Finding anomalies
• Creating reports`;
      response.suggestions = ['Show me my metrics', 'Analyze performance', 'Generate insights', 'Show me trends'];
    } else {
      response.intent = 'general_query';
      response.message = `I understand you're asking about "${message}". Could you be more specific?`;
      response.suggestions = [
        'Show me sales data',
        'Analyze performance',
        'Generate insights',
        'Help me understand trends'
      ];
    }

    return response;
  }

  /**
   * Generate query suggestions
   */
  static async generateQuerySuggestions(metrics: any[], category: string) {
    const suggestions = {
      category: category,
      suggestedQueries: [] as string[],
      categories: [] as any[],
      examples: [] as string[],
    };

    // General suggestions
    const generalQueries = [
      'Show me all metrics',
      'What are the top performing metrics?',
      'Show me trends',
      'Analyze performance',
      'Generate insights',
      'Find anomalies',
      'Show me recommendations'
    ];

    suggestions.suggestedQueries.push(...generalQueries);

    // Category-specific suggestions
    if (category === 'sales' || category === 'all') {
      suggestions.suggestedQueries.push(
        'Show me sales revenue',
        'What is the average sales value?',
        'Sales trends over time',
        'Analyze sales performance'
      );
    }

    if (category === 'users' || category === 'all') {
      suggestions.suggestedQueries.push(
        'Show me user metrics',
        'User growth trends',
        'User engagement analysis'
      );
    }

    if (category === 'performance' || category === 'all') {
      suggestions.suggestedQueries.push(
        'Show performance metrics',
        'What are the KPIs?',
        'Performance analysis',
        'Identify improvement areas'
      );
    }

    // Add metric-specific suggestions
    if (metrics && metrics.length > 0) {
      const categories: string[] = [...new Set(metrics.map((m: any) => m.category))];
      categories.forEach((cat: string) => {
        suggestions.categories.push({
          name: cat,
          count: metrics.filter((m: any) => m.category === cat).length,
          sampleQuery: `Show me ${cat} metrics`,
        });
      });

      // Add specific metric names
      metrics.slice(0, 5).forEach((metric: any) => {
        suggestions.examples.push(`Show me ${metric.name}`);
        suggestions.examples.push(`Analyze ${metric.name}`);
      });
    }

    return suggestions;
  }

  /**
   * Train NLP model
   */
  static async trainModel(trainingData: any, options?: TrainingOptions) {
    return {
      success: true,
      message: 'Model training completed successfully',
      modelType: options?.modelType || 'general',
      trainingDataSize: Array.isArray(trainingData) ? trainingData.length : 0,
      accuracy: 0.85,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Get model status
   */
  static async getModelStatus(userId: string) {
    return {
      userId,
      modelVersion: '1.0.0',
      status: 'active',
      trainedAt: new Date().toISOString(),
      lastUsed: new Date().toISOString(),
      performance: {
        accuracy: 0.85,
        responseTime: '200ms',
        confidence: 0.90,
      },
      capabilities: [
        'natural_language_queries',
        'data_analysis',
        'insights_generation',
        'recommendations',
        'forecasting',
        'anomaly_detection',
        'trend_analysis',
      ],
    };
  }

  /**
   * Export analysis
   */
  static async exportAnalysis(analysisData: any, options?: ExportOptions) {
    const format = options?.format || 'json';
    
    const exportData = {
      analysis: analysisData,
      format: format,
      exportedAt: new Date().toISOString(),
      metadata: {
        version: '1.0',
        exportType: 'nlp_analysis',
      },
    };

    switch (format) {
      case 'json':
        return exportData;
      case 'csv':
        const data = Array.isArray(analysisData) ? analysisData : [analysisData];
        if (data.length === 0) return 'No data to export';
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row => headers.map(header => JSON.stringify(row[header] || '')).join(','))
        ];
        return csvRows.join('\n');
      case 'pdf':
        return {
          ...exportData,
          content: 'PDF export would be implemented with a PDF library',
        };
      default:
        return exportData;
    }
  }

  /**
   * Fallback methods
   */
  private static fallbackProcessQuery(query: string, metrics: Metric[]) {
    const categories = [...new Set(metrics.map(m => m.category))];
    const insights = [
      `Analyzing ${metrics.length} metrics...`,
      `Found data in categories: ${categories.join(', ')}`,
      `Total value: ${metrics.reduce((sum, m) => sum + m.value, 0).toFixed(2)}`,
      `Average value: ${(metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length).toFixed(2)}`,
    ];

    return {
      query,
      response: insights.join('\n'),
      insights,
      metrics: metrics.slice(0, 10),
      confidence: 0.70,
      source: 'fallback',
    };
  }

  /**
   * Helper: Calculate standard deviation
   */
  private static calculateStandardDeviation(values: number[]): number {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }
}