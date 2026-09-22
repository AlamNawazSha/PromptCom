'use client';

import React, { useState } from 'react';
import { ScanResultPayload } from '@/types';
import { CircularGauge } from '../threat-meter/circular-gauge';
import { FindingsList } from './findings-list';
import { EntityGrid } from './entity-grid';
import { VerificationChecklist } from './verification-checklist';
import { ActionRecommendations } from './action-recommendations';
import { 
  Printer, 
  Share2, 
  RotateCcw, 
  ShieldCheck, 
  AlertTriangle, 
  Globe, 
  Info,
  Check,
  Calendar,
  Lock,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

interface ScanResultViewProps {
  result: ScanResultPayload;
  onReset?: () => void;
}

export function ScanResultView({ result, onReset }: ScanResultViewProps) {
  const [copied, setCopied] = useState(false);

  const copyScanSummary = () => {
    const textToCopy = `SCAMSHIELD AI Security Report\nScan ID: ${result.id}\nThreat Index: ${result.threatScore}% (${result.riskLevel})\nSummary: ${result.summary}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Threat Meter Header Banner */}
      <div className="rounded-3xl border border-slate-800 bg-[#070b13]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top Control Bar */}
        <div className="flex flex-wrap items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="text-cyan-400 font-bold">SCAN ID:</span>
            <span>{result.id}</span>
            <span>•</span>
            <span>{new Date(result.createdAt).toLocaleDateString()}</span>
          </div>

          <div className="flex items-center gap-2 no-print">
            <button
              onClick={copyScanSummary}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
              <span>{copied ? 'Copied' : 'Share'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-mono text-slate-300 hover:text-white hover:border-slate-700 transition-all"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print Dossier</span>
            </button>

            {onReset && (
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-1.5 text-xs font-mono text-cyan-300 hover:bg-cyan-500/20 transition-all"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>New Scan</span>
              </button>
            )}
          </div>
        </div>

        {/* Circular Gauge Readout & Summary */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="flex justify-center">
            <CircularGauge
              score={result.threatScore}
              riskLevel={result.riskLevel}
              confidence={result.confidence}
              breakdown={result.breakdown}
            />
          </div>

          <div className="space-y-4">
            <div>
              <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 block mb-1">
                Executive Security Assessment
              </span>
              <p className="text-sm text-slate-200 leading-relaxed font-mono">
                {result.summary}
              </p>
            </div>

            {/* Offline Fallback Badge */}
            {result.isOfflineFallback && (
              <div className="flex items-start gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs font-mono text-amber-300">
                <Info className="h-4 w-4 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Deterministic Rule Fallback Active:</span>
                  AI semantic engine was bypassed or offline. Findings were verified via deterministic regex and heuristic cybersecurity rules.
                </div>
              </div>
            )}

            {/* Scanned Input Preview */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-3">
              <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1 font-mono">
                Target Evidence Preview:
              </span>
              <p className="text-xs text-slate-300 font-mono italic line-clamp-3">
                &quot;{result.inputPreview}&quot;
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Domain Intelligence Section (If URL Scan or Domain check present) */}
      {result.domainCheck && (
        <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-cyan-400" />
              <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                Domain Intelligence (Authentic RDAP Data)
              </h4>
            </div>
            <span className="text-xs font-mono text-slate-400 font-bold">{result.domainCheck.domain}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <span className="text-[10px] text-slate-400 block">Domain Age</span>
              <span className="text-white font-bold block mt-1">
                {result.domainCheck.domainAgeDays !== null
                  ? `${result.domainCheck.domainAgeDays} days (${(result.domainCheck.domainAgeDays / 365).toFixed(1)} yrs)`
                  : 'Domain age unavailable'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <span className="text-[10px] text-slate-400 block">Registered On</span>
              <span className="text-white font-bold block mt-1">
                {result.domainCheck.registrationDate || 'Unavailable'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <span className="text-[10px] text-slate-400 block">HTTPS & SSL</span>
              <span className={`font-bold block mt-1 ${result.domainCheck.isHttps ? 'text-emerald-400' : 'text-rose-400'}`}>
                {result.domainCheck.isHttps ? 'Secure (HTTPS)' : 'Insecure (HTTP)'}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3">
              <span className="text-[10px] text-slate-400 block">Registrar</span>
              <span className="text-white font-bold block mt-1 truncate">
                {result.domainCheck.registrar || 'Unavailable / Private'}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Sequential "Why This Was Flagged" Cards */}
      <FindingsList findings={result.findings} />

      {/* Structured Entity Detection */}
      <EntityGrid entities={result.entities} />

      {/* Interactive Verification Checklist */}
      <VerificationChecklist initialItems={result.verificationChecklist} />

      {/* Actionable Recommendations */}
      <ActionRecommendations riskLevel={result.riskLevel} actions={result.recommendedActions} />
    </div>
  );
}
