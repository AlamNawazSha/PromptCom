import React from 'react';
import { ShieldAlert, AlertTriangle, AlertOctagon, Gauge, Globe } from 'lucide-react';

interface StatsCardsProps {
  metrics: {
    totalScans: number;
    highRiskScans: number;
    criticalScans: number;
    urlScans: number;
    avgThreatScore: number;
  };
}

export function StatsCards({ metrics }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Scans */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">TOTAL SCANS</span>
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="text-3xl font-black font-mono text-white">
          {metrics.totalScans.toLocaleString()}
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2">
          Inspected offers & messages
        </p>
      </div>

      {/* High Risk Scans */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">HIGH RISK</span>
          <AlertTriangle className="h-5 w-5 text-orange-400" />
        </div>
        <div className="text-3xl font-black font-mono text-orange-400">
          {metrics.highRiskScans.toLocaleString()}
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2">
          Severe advance-fee red flags
        </p>
      </div>

      {/* Critical Scans */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">CRITICAL THREATS</span>
          <AlertOctagon className="h-5 w-5 text-rose-500" />
        </div>
        <div className="text-3xl font-black font-mono text-rose-400">
          {metrics.criticalScans.toLocaleString()}
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2">
          Credential theft & malicious traps
        </p>
      </div>

      {/* Average Threat Score */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
        <div className="flex items-center justify-between text-slate-400 mb-2">
          <span className="text-xs font-mono uppercase tracking-wider">AVG THREAT INDEX</span>
          <Gauge className="h-5 w-5 text-cyan-400" />
        </div>
        <div className="text-3xl font-black font-mono text-cyan-400">
          {metrics.avgThreatScore}%
        </div>
        <p className="text-[11px] font-mono text-slate-400 mt-2">
          Composite risk average
        </p>
      </div>
    </div>
  );
}
