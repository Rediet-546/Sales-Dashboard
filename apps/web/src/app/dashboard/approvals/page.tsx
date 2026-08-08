'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FiCheck, FiX, FiClock, FiUser } from 'react-icons/fi';

interface Approval {
  id: string;
  type: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reason: string;
  requestData: any;
  manager: { name: string; email: string };
  admin: { name: string; email: string };
  createdAt: string;
}

export default function ApprovalsPage() {
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    fetchApprovals();
  }, []);

  const fetchApprovals = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (response.ok) {
        setApprovals(data.requests || []);
      }
    } catch (error) {
      console.error('Failed to fetch approvals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/${id}/approve`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchApprovals();
      }
    } catch (error) {
      console.error('Failed to approve:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/approvals/${id}/reject`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        fetchApprovals();
      }
    } catch (error) {
      console.error('Failed to reject:', error);
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
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Approvals</h1>
        <p className="text-gray-500 mt-1">Manage pending approval requests</p>
      </div>

      <div className="space-y-4">
        {approvals.map((approval) => (
          <Card key={approval.id} className="p-6 bg-white shadow-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Badge variant={
                    approval.status === 'APPROVED' ? 'success' :
                    approval.status === 'REJECTED' ? 'destructive' :
                    'outline'
                  }>
                    {approval.status}
                  </Badge>
                  <span className="text-sm font-medium text-gray-500">
                    {approval.type.replace('_', ' ')}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-600">Manager: {approval.manager.name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiUser className="text-gray-400" />
                    <span className="text-gray-600">Admin: {approval.admin.name}</span>
                  </div>
                </div>

                {approval.reason && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-medium">Reason:</span> {approval.reason}
                  </p>
                )}

                <div className="mt-2 text-xs text-gray-400">
                  {new Date(approval.createdAt).toLocaleString()}
                </div>
              </div>

              {approval.status === 'PENDING' && user.role === 'ADMIN' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(approval.id)}
                    className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200 transition"
                  >
                    <FiCheck />
                  </button>
                  <button
                    onClick={() => handleReject(approval.id)}
                    className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition"
                  >
                    <FiX />
                  </button>
                </div>
              )}

              {approval.status === 'PENDING' && user.role === 'MANAGER' && (
                <div className="flex items-center gap-2 text-yellow-600">
                  <FiClock />
                  <span className="text-sm">Waiting for approval</span>
                </div>
              )}
            </div>
          </Card>
        ))}

        {approvals.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No approval requests found</p>
          </div>
        )}
      </div>
    </div>
  );
}