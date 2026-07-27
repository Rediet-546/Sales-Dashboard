'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FiFileText, 
  FiPlus, 
  FiDownload, 
  FiEye, 
  FiTrash2,
  FiCalendar,
  FiPieChart,
  FiBarChart2,
  FiTrendingUp,
  FiClock,
  FiRefreshCw,
  FiPrinter,
  FiMail,
  FiShare2
} from 'react-icons/fi';

interface Report {
  id: string;
  name: string;
  description: string;
  type: string;
  data: any;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/user`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setReports(data.reports || []);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: reportType,
          dateRange,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setShowGenerateModal(false);
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to generate report:', error);
    }
  };

  const downloadReport = async (reportId: string, format: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/download?format=${format}`,
        { headers: { 'Authorization': `Bearer ${token}` } }
      );

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report.${format}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      }
    } catch (error) {
      console.error('Failed to download report:', error);
    }
  };

  const deleteReport = async (reportId: string) => {
    if (!confirm('Are you sure you want to delete this report?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` },
      });

      if (response.ok) {
        fetchReports();
      }
    } catch (error) {
      console.error('Failed to delete report:', error);
    }
  };

  const getReportIcon = (type: string) => {
    switch (type) {
      case 'summary': return <FiFileText className="text-blue-600" />;
      case 'analytics': return <FiPieChart className="text-purple-600" />;
      case 'forecast': return <FiTrendingUp className="text-green-600" />;
      default: return <FiBarChart2 className="text-orange-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Reports</h1>
          <p className="text-gray-500 mt-1">Generate and manage analytics reports</p>
        </div>
        <button
          onClick={() => setShowGenerateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <FiPlus />
          Generate Report
        </button>
      </div>

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reports.map((report) => (
          <Card key={report.id} className="p-6 bg-white shadow-lg hover:shadow-xl transition group">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="p-3 bg-blue-50 rounded-lg">
                  {getReportIcon(report.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{report.name}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{report.description}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {report.type}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => setSelectedReport(report)}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition text-sm"
              >
                <FiEye size={16} /> View
              </button>
              <button
                onClick={() => downloadReport(report.id, 'pdf')}
                className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-lg transition text-sm"
              >
                <FiDownload size={16} /> PDF
              </button>
              <button
                onClick={() => deleteReport(report.id)}
                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <FiTrash2 size={18} />
              </button>
            </div>
          </Card>
        ))}

        {reports.length === 0 && (
          <div className="col-span-full text-center py-12">
            <FiFileText className="mx-auto text-4xl text-gray-300 mb-4" />
            <p className="text-gray-500">No reports generated yet</p>
            <button
              onClick={() => setShowGenerateModal(true)}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Generate your first report →
            </button>
          </div>
        )}
      </div>

      {/* Generate Report Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Generate Report</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Report Type
                </label>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="summary">Summary Report</option>
                  <option value="analytics">Analytics Report</option>
                  <option value="forecast">Forecast Report</option>
                  <option value="detailed">Detailed Report</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowGenerateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={generateReport}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Generate
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}