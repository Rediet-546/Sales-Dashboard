'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { 
  FiTrendingUp, 
  FiTrendingDown, 
  FiBarChart2, 
  FiPieChart,
  FiRefreshCw,
  FiSliders,
  FiActivity
} from 'react-icons/fi';

export default function WhatIfPage() {
  const [scenario, setScenario] = useState({
    metricId: '',
    change: 0,
    type: 'percentage',
  });
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/what-if/analyze`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(scenario),
      });

      const data = await response.json();
      if (response.ok) {
        setResult(data.data);
      }
    } catch (error) {
      console.error('Failed to analyze scenario:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">What-If Analysis</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiRefreshCw className="text-blue-600 text-lg" />
          Scenario Planning
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <FiSliders className="text-blue-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Scenarios</p>
              <p className="text-2xl font-bold text-gray-900">3</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <FiTrendingUp className="text-green-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Optimistic</p>
              <p className="text-2xl font-bold text-green-600">+24%</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-100 rounded-lg">
              <FiTrendingDown className="text-red-600 text-xl" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pessimistic</p>
              <p className="text-2xl font-bold text-red-600">-12%</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Analysis Form */}
      <Card className="p-6 bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center gap-2 mb-4">
            <FiActivity className="text-blue-600 text-xl" />
            <h2 className="text-lg font-semibold text-gray-900">Create Scenario</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Metric ID
              </label>
              <input
                type="text"
                value={scenario.metricId}
                onChange={(e) => setScenario({ ...scenario, metricId: e.target.value })}
                placeholder="Enter metric ID"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Change Percentage
              </label>
              <input
                type="number"
                value={scenario.change}
                onChange={(e) => setScenario({ ...scenario, change: parseFloat(e.target.value) })}
                placeholder="e.g., 10 for +10%"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Change Type
            </label>
            <select
              value={scenario.type}
              onChange={(e) => setScenario({ ...scenario, type: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="percentage">Percentage</option>
              <option value="absolute">Absolute Value</option>
              <option value="compound">Compound Growth</option>
            </select>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
          >
            <FiSliders className="text-sm" />
            {showAdvanced ? 'Hide Advanced Options' : 'Show Advanced Options'}
          </button>

          {showAdvanced && (
            <div className="p-4 bg-gray-50 rounded-lg space-y-4 border border-gray-200">
              <h3 className="font-medium text-gray-700">Advanced Parameters</h3>
              
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Time Horizon (Days)
                </label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Confidence Level
                </label>
                <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500">
                  <option value="0.95">95%</option>
                  <option value="0.90">90%</option>
                  <option value="0.85">85%</option>
                  <option value="0.80">80%</option>
                </select>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Analyzing Scenario...
              </>
            ) : (
              <>
                <FiBarChart2 />
                Analyze Scenario
              </>
            )}
          </button>
        </form>
      </Card>

      {/* Results */}
      {result && (
        <Card className="p-6 bg-white shadow-lg border-l-4 border-blue-500">
          <div className="flex items-center gap-2 mb-4">
            <FiPieChart className="text-blue-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">Scenario Analysis Results</h3>
          </div>

          <div className="space-y-4">
            {/* Current vs Projected */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-500">Current Value</p>
                <p className="text-2xl font-bold text-blue-600">
                  {result.current?.value || 'N/A'}
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-500">Projected Value</p>
                <p className="text-2xl font-bold text-green-600">
                  {result.projected?.value || 'N/A'}
                </p>
              </div>
            </div>

            {/* Impact */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500">Impact</p>
              <p className={`text-2xl font-bold ${
                result.projected?.impact > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {result.projected?.impact || 'N/A'}
              </p>
            </div>

            {/* Recommendations */}
            {result.recommendations && result.recommendations.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <FiTrendingUp className="text-blue-600" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-gray-600">
                      <span className="text-blue-500 mt-1">•</span>
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Risk Assessment */}
            {result.risk && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Risk Assessment</h4>
                <div className="flex items-center gap-4">
                  <span className="text-gray-600">Risk Level:</span>
                  <span className={`font-semibold px-3 py-1 rounded-full text-sm ${
                    result.risk.level === 'High' ? 'bg-red-100 text-red-700' :
                    result.risk.level === 'Medium' ? 'bg-orange-100 text-orange-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {result.risk.level || 'Unknown'}
                  </span>
                </div>
                {result.risk.factors && result.risk.factors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm text-gray-500">Risk Factors:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {result.risk.factors.map((factor: string, index: number) => (
                        <li key={index}>{factor}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Projections */}
            {result.projected?.projections && result.projected.projections.length > 0 && (
              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-700 mb-2">Projections</h4>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 text-gray-500">Period</th>
                        <th className="text-right py-2 text-gray-500">Value</th>
                        <th className="text-right py-2 text-gray-500">Change</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.projected.projections.slice(0, 5).map((proj: any, index: number) => (
                        <tr key={index} className="border-b border-gray-100">
                          <td className="py-2 text-gray-700">Day {proj.day}</td>
                          <td className="py-2 text-right font-medium">{proj.value.toFixed(2)}</td>
                          <td className={`py-2 text-right ${proj.change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {proj.change >= 0 ? '+' : ''}{proj.change.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}