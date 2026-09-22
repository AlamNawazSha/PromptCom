'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface ThreatChartsProps {
  timelineData?: Array<{ date: string; score: number }>;
  riskDistData?: Array<{ name: string; value: number; color: string }>;
  scanTypeData?: Array<{ name: string; count: number }>;
}

export function ThreatCharts({
  timelineData,
  riskDistData,
  scanTypeData,
}: ThreatChartsProps) {
  // Default fallback data for visual representation if empty
  const defaultTimeline = [
    { date: 'Mon', score: 25 },
    { date: 'Tue', score: 68 },
    { date: 'Wed', score: 45 },
    { date: 'Thu', score: 85 },
    { date: 'Fri', score: 32 },
    { date: 'Sat', score: 78 },
    { date: 'Sun', score: 55 },
  ];

  const defaultRiskDist = [
    { name: 'Low', value: 30, color: '#10b981' },
    { name: 'Guarded', value: 20, color: '#06b6d4' },
    { name: 'Suspicious', value: 15, color: '#f59e0b' },
    { name: 'High Risk', value: 25, color: '#f97316' },
    { name: 'Critical', value: 10, color: '#ef4444' },
  ];

  const defaultScanType = [
    { name: 'Job Offer', count: 48 },
    { name: 'Rental', count: 24 },
    { name: 'URL/Phish', count: 36 },
    { name: 'Document', count: 12 },
  ];

  const activeTimeline = timelineData && timelineData.length > 0 ? timelineData : defaultTimeline;
  const activeRiskDist = riskDistData && riskDistData.length > 0 ? riskDistData : defaultRiskDist;
  const activeScanType = scanTypeData && scanTypeData.length > 0 ? scanTypeData : defaultScanType;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Chart 1: Threat Score Timeline */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md lg:col-span-2">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
          📈 Threat Index Velocity (Weekly Trend)
        </h4>
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={activeTimeline}>
              <defs>
                <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f5ff" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00f5ff" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} fontFamily="monospace" />
              <YAxis stroke="#64748b" fontSize={11} fontFamily="monospace" domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
              <Area
                type="monotone"
                dataKey="score"
                stroke="#00f5ff"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#scoreGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Risk Breakdown Donut */}
      <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white mb-4">
          🎯 Threat Severity Distribution
        </h4>
        <div className="h-48 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={activeRiskDist}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {activeRiskDist.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#090d16" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#090d16',
                  borderColor: '#1e293b',
                  borderRadius: '12px',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-2 text-[10px] font-mono">
          {activeRiskDist.map((item, idx) => (
            <div key={idx} className="flex items-center gap-1 text-slate-300">
              <span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />
              <span>{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
