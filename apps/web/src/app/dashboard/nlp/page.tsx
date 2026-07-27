'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { FiSend, FiCpu, FiTrendingUp, FiBarChart2, FiFileText } from 'react-icons/fi';

export default function NLPPage() {
  const [query, setQuery] = useState('');
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/nlp/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();
      if (res.ok) {
        setResponse(data.data);
      } else {
        setResponse({ error: data.error || 'Failed to process query' });
      }
    } catch (error) {
      setResponse({ error: 'An error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">NLP Query</h1>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <FiCpu className="text-blue-600" />
          AI Powered
        </div>
      </div>

      <Card className="p-6 bg-white shadow-lg">
        <form onSubmit={handleSubmit} className="flex gap-4">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {loading ? 'Processing...' : <><FiSend /> Ask</>}
          </button>
        </form>
      </Card>

      {response && (
        <Card className="p-6 bg-white shadow-lg">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span className="font-medium">Query:</span>
              <span>{query}</span>
            </div>
            
            {response.error ? (
              <div className="text-red-600">{response.error}</div>
            ) : (
              <>
                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-2">Insights</h3>
                  <ul className="space-y-2">
                    {response.insights?.map((insight: string, index: number) => (
                      <li key={index} className="flex items-start gap-2 text-gray-700">
                        <span className="text-blue-500">•</span>
                        {insight}
                      </li>
                    ))}
                  </ul>
                </div>

                {response.metrics && response.metrics.length > 0 && (
                  <div className="border-t pt-4">
                    <h3 className="font-semibold text-gray-900 mb-2">Related Metrics</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {response.metrics.slice(0, 6).map((metric: any, index: number) => (
                        <div key={index} className="p-2 bg-gray-50 rounded">
                          <p className="text-sm font-medium text-gray-700">{metric.name}</p>
                          <p className="text-sm text-gray-500">{metric.value} {metric.unit || ''}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 bg-white shadow-lg">
          <FiTrendingUp className="text-blue-600 text-2xl mb-3" />
          <h3 className="font-semibold text-gray-900">Trend Analysis</h3>
          <p className="text-sm text-gray-500 mt-1">Ask about trends in your data</p>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <FiBarChart2 className="text-green-600 text-2xl mb-3" />
          <h3 className="font-semibold text-gray-900">Data Insights</h3>
          <p className="text-sm text-gray-500 mt-1">Get AI-powered insights</p>
        </Card>

        <Card className="p-6 bg-white shadow-lg">
          <FiFileText className="text-purple-600 text-2xl mb-3" />
          <h3 className="font-semibold text-gray-900">Report Generation</h3>
          <p className="text-sm text-gray-500 mt-1">Generate reports using natural language</p>
        </Card>
      </div>
    </div>
  );
}