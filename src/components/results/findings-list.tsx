import React from 'react';
import { ScanFindingItem, FindingSeverity } from '@/types';
import { AlertTriangle, AlertCircle, ShieldAlert, CheckCircle2, ArrowRight } from 'lucide-react';

interface FindingsListProps {
  findings: ScanFindingItem[];
}

export function FindingsList({ findings }: FindingsListProps) {
  if (!findings || findings.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-emerald-400 mb-2" />
        <h4 className="font-mono text-sm font-bold text-white mb-1">
          No Explicit Deceptive Red Flags Detected
        </h4>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          No known advance-fee payment triggers, credential traps, or suspicious domains were found. Automated screening does not guarantee authenticity—always verify independently.
        </p>
      </div>
    );
  }

  const getSeverityBadge = (severity: FindingSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'HIGH':
        return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'MEDIUM':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      case 'LOW':
      default:
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-cyan-400" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider text-white">
            Why This Was Flagged ({findings.length} Indicators Found)
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">Explainable Forensics</span>
      </div>

      <div className="space-y-3">
        {findings.map((finding, idx) => {
          const numberLabel = String(idx + 1).padStart(2, '0');
          const badgeClass = getSeverityBadge(finding.severity);

          return (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800/90 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md hover:border-slate-700 transition-all"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-xs font-bold text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {numberLabel}
                  </span>
                  <h4 className="font-mono text-sm font-bold text-white tracking-wide">
                    {finding.title}
                  </h4>
                </div>

                <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-mono font-bold uppercase border ${badgeClass}`}>
                  {finding.severity} RISK
                </span>
              </div>

              {/* Quoted Evidence */}
              {finding.evidence && (
                <div className="my-2.5 rounded-lg border-l-2 border-amber-400/80 bg-slate-900/60 p-2.5 text-xs font-mono text-slate-300 italic">
                  <span className="text-[10px] uppercase font-bold text-amber-400 block not-italic mb-0.5">
                    Extracted Evidence:
                  </span>
                  "{finding.evidence}"
                </div>
              )}

              {/* Forensic Explanation */}
              <p className="text-xs text-slate-300 leading-relaxed mt-2">
                {finding.explanation}
              </p>

              {/* Recommended Action */}
              {finding.recommendedAction && (
                <div className="mt-3 flex items-start gap-2 pt-2 border-t border-slate-800/60 text-xs font-mono text-cyan-300">
                  <ArrowRight className="h-3.5 w-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-white">Action:</strong> {finding.recommendedAction}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
