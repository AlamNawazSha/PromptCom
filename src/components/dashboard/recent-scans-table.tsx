'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { RiskBadge } from '../threat-meter/risk-badge';
import { RiskLevel } from '@/types';
import { 
  Search, 
  Trash2, 
  ExternalLink, 
  Globe, 
  FileText, 
  UploadCloud, 
  Filter 
} from 'lucide-react';

interface ScanRow {
  id: string;
  scanType: string;
  threatScore: number;
  riskLevel: RiskLevel;
  inputPreview: string;
  domain?: string | null;
  createdAt: string;
}

interface RecentScansTableProps {
  scans: ScanRow[];
  onDeleteScan?: (id: string) => void;
}

export function RecentScansTable({ scans, onDeleteScan }: RecentScansTableProps) {
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL');

  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      s.inputPreview.toLowerCase().includes(search.toLowerCase()) ||
      (s.domain && s.domain.toLowerCase().includes(search.toLowerCase())) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    const matchesRisk = riskFilter === 'ALL' || s.riskLevel === riskFilter;

    return matchesSearch && matchesRisk;
  });

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'URL':
        return <Globe className="h-4 w-4 text-cyan-400" />;
      case 'DOCUMENT':
        return <UploadCloud className="h-4 w-4 text-purple-400" />;
      case 'TEXT':
      default:
        return <FileText className="h-4 w-4 text-blue-400" />;
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
          <span>📋</span> Security Audit Log ({filteredScans.length} Records)
        </h4>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          {/* Search bar */}
          <div className="relative flex-1 sm:w-48">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search target..."
              className="w-full rounded-lg border border-slate-800 bg-slate-900/80 py-1.5 pl-8 pr-3 text-xs font-mono text-slate-200 placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
            />
          </div>

          {/* Risk Filter */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="rounded-lg border border-slate-800 bg-slate-900/80 px-2.5 py-1.5 text-xs font-mono text-slate-200 focus:border-cyan-500 focus:outline-none"
          >
            <option value="ALL">All Risk Levels</option>
            <option value="CRITICAL">Critical Only</option>
            <option value="HIGH_RISK">High Risk Only</option>
            <option value="SUSPICIOUS">Suspicious</option>
            <option value="GUARDED">Guarded</option>
            <option value="LOW">Low Risk</option>
          </select>
        </div>
      </div>

      {/* Scans Table */}
      {filteredScans.length === 0 ? (
        <div className="py-12 text-center text-xs font-mono text-slate-400">
          No security scan records match your filter criteria.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Type</th>
                <th className="pb-3 font-semibold">Target Preview</th>
                <th className="pb-3 font-semibold">Score</th>
                <th className="pb-3 font-semibold">Risk Classification</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredScans.map((scan) => (
                <tr key={scan.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 text-slate-400 whitespace-nowrap">
                    {new Date(scan.createdAt).toLocaleDateString()}
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      {getTypeIcon(scan.scanType)}
                      <span>{scan.scanType}</span>
                    </div>
                  </td>
                  <td className="py-3 max-w-xs truncate text-slate-200">
                    {scan.domain || scan.inputPreview}
                  </td>
                  <td className="py-3 font-bold text-white whitespace-nowrap">
                    {scan.threatScore}%
                  </td>
                  <td className="py-3 whitespace-nowrap">
                    <RiskBadge level={scan.riskLevel} size="sm" />
                  </td>
                  <td className="py-3 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/scan/${scan.id}`}
                        className="rounded p-1 text-slate-400 hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                        title="View Full Forensics Report"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                      {onDeleteScan && (
                        <button
                          onClick={() => onDeleteScan(scan.id)}
                          className="rounded p-1 text-slate-400 hover:bg-rose-500/10 hover:text-rose-400 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
