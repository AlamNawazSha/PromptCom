'use client';

import React, { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/stats-cards';
import { ThreatCharts } from '@/components/dashboard/threat-charts';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';
import { LayoutDashboard, RefreshCw, ShieldAlert, AlertCircle } from 'lucide-react';

export default function DashboardPage() {
  const [metrics, setMetrics] = useState({
    totalScans: 0,
    highRiskScans: 0,
    criticalScans: 0,
    urlScans: 0,
    avgThreatScore: 0,
  });
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = React.useCallback(async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/scans?limit=25');
      const data = await res.json();
      if (data.success) {
        setMetrics(data.metrics || {
          totalScans: 0,
          highRiskScans: 0,
          criticalScans: 0,
          urlScans: 0,
          avgThreatScore: 0,
        });
        setScans(data.scans || []);
      }
    } catch {
      setError('Unable to load real-time telemetry. Showing cached overview.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleDeleteScan = async (id: string) => {
    try {
      const res = await fetch(`/api/scans/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setScans((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <LayoutDashboard className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              SECURITY OPERATIONS CENTER (SOC)
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Real-time phishing telemetry, threat index velocity, and audit telemetry.
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={isLoading}
          className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-2 text-xs font-mono font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          <span>Sync Telemetry</span>
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Top Metric Stats Cards */}
      <StatsCards metrics={metrics} />

      {/* Interactive Charts Grid */}
      <ThreatCharts />

      {/* Audit Log Table */}
      <RecentScansTable scans={scans} onDeleteScan={handleDeleteScan} />
    </div>
  );
}
