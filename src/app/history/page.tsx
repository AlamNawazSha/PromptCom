'use client';

import React, { useEffect, useState } from 'react';
import { RecentScansTable } from '@/components/dashboard/recent-scans-table';
import { History, Download, Trash2, RefreshCw, ShieldCheck } from 'lucide-react';

export default function HistoryPage() {
  const [scans, setScans] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/scans?limit=100');
      const data = await res.json();
      if (data.success) {
        setScans(data.scans || []);
      }
    } catch (err) {
      console.error('History load failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

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

  const exportCsv = () => {
    if (scans.length === 0) return;
    const headers = ['ID', 'Date', 'Type', 'Target', 'ThreatScore', 'RiskLevel', 'Summary'];
    const rows = scans.map((s) => [
      s.id,
      new Date(s.createdAt).toISOString(),
      s.scanType,
      `"${(s.domain || s.inputPreview || '').replace(/"/g, '""')}"`,
      s.threatScore,
      s.riskLevel,
      `"${(s.summary || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `scamshield_audit_history_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <History className="h-6 w-6 text-cyan-400" />
            <h1 className="text-2xl sm:text-3xl font-black font-mono tracking-tight text-white">
              INSPECTION AUDIT LOG
            </h1>
          </div>
          <p className="text-xs font-mono text-slate-400">
            Persistent forensic log of past scam scans, risk scores, and extracted indicators.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadHistory}
            disabled={isLoading}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-3.5 py-2 text-xs font-mono text-slate-200 hover:text-white hover:bg-slate-800 transition-all"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>

          <button
            onClick={exportCsv}
            disabled={scans.length === 0}
            className="flex items-center gap-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 px-3.5 py-2 text-xs font-mono font-bold text-cyan-300 hover:bg-cyan-500/20 transition-all disabled:opacity-50"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      <RecentScansTable scans={scans} onDeleteScan={handleDeleteScan} />
    </div>
  );
}
