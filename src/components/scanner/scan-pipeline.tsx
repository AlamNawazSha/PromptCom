'use client';

import React, { useEffect, useState } from 'react';
import { 
  Terminal, 
  Search, 
  CreditCard, 
  ShieldCheck, 
  Cpu, 
  Gauge, 
  FileText, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';

interface ScanPipelineProps {
  isScanning: boolean;
  onComplete?: () => void;
}

const STAGES = [
  { id: 1, label: 'INITIALIZING SECURITY SCAN', icon: Terminal, delay: 300 },
  { id: 2, label: 'EXTRACTING ENTITIES & INDICATORS', icon: Search, delay: 500 },
  { id: 3, label: 'ANALYZING LINGUISTIC & URGENCY PATTERNS', icon: FileText, delay: 500 },
  { id: 4, label: 'CHECKING PAYMENT & ADVANCE-FEE DEMANDS', icon: CreditCard, delay: 500 },
  { id: 5, label: 'VERIFYING CONTACT & DOMAIN SIGNALS', icon: ShieldCheck, delay: 500 },
  { id: 6, label: 'GEMINI AI SEMANTIC THREAT INSPECTION', icon: Cpu, delay: 600 },
  { id: 7, label: 'CALCULATING COMPOSITE THREAT INDEX', icon: Gauge, delay: 400 },
];

export function ScanPipeline({ isScanning }: ScanPipelineProps) {
  const [activeStage, setActiveStage] = useState(0);

  useEffect(() => {
    if (!isScanning) {
      setActiveStage(0);
      return;
    }

    let current = 0;
    const interval = setInterval(() => {
      current += 1;
      if (current < STAGES.length) {
        setActiveStage(current);
      } else {
        clearInterval(interval);
      }
    }, 450);

    return () => clearInterval(interval);
  }, [isScanning]);

  if (!isScanning) return null;

  return (
    <div className="w-full max-w-2xl mx-auto rounded-2xl border border-cyan-500/30 bg-[#090d16]/90 p-6 backdrop-blur-xl shadow-[0_0_30px_rgba(0,245,255,0.15)] relative overflow-hidden">
      {/* Laser line effect */}
      <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent animate-pulse" />

      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Loader2 className="h-5 w-5 text-cyan-400 animate-spin" />
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-cyan-400">
            Threat Analysis Engine Running
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-400">
          Stage {Math.min(activeStage + 1, STAGES.length)} of {STAGES.length}
        </span>
      </div>

      <div className="space-y-3">
        {STAGES.map((stage, idx) => {
          const Icon = stage.icon;
          const isDone = idx < activeStage;
          const isCurrent = idx === activeStage;
          const isPending = idx > activeStage;

          return (
            <div
              key={stage.id}
              className={`flex items-center justify-between rounded-xl px-4 py-2.5 transition-all text-xs font-mono ${
                isCurrent
                  ? 'bg-cyan-500/15 border border-cyan-500/40 text-white shadow-[0_0_15px_rgba(0,245,255,0.1)]'
                  : isDone
                  ? 'bg-emerald-500/5 border border-emerald-500/20 text-emerald-300'
                  : 'bg-slate-900/30 border border-slate-800/40 text-slate-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`h-4 w-4 ${
                    isCurrent
                      ? 'text-cyan-400 animate-pulse'
                      : isDone
                      ? 'text-emerald-400'
                      : 'text-slate-400'
                  }`}
                />
                <span className={isCurrent ? 'font-bold tracking-wide' : ''}>
                  {stage.label}
                </span>
              </div>

              <div>
                {isDone && <CheckCircle2 className="h-4 w-4 text-emerald-400" />}
                {isCurrent && <Loader2 className="h-4 w-4 text-cyan-400 animate-spin" />}
                {isPending && <span className="text-[10px] text-slate-400 uppercase">WAITING</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
