'use client';

import React, { useState } from 'react';
import { 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Send, 
  AlertCircle,
  FileCheck2,
  Home,
  Briefcase,
  CreditCard
} from 'lucide-react';
import { DEMO_SCENARIOS } from '@/lib/demo/scenarios';

interface MessageScannerProps {
  onScan: (content: string, category: string) => void;
  isLoading: boolean;
}

export function MessageScanner({ onScan, isLoading }: MessageScannerProps) {
  const [content, setContent] = useState('');
  const [analysisType, setAnalysisType] = useState('AUTO_DETECT');
  const [error, setError] = useState('');

  const handleScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!content.trim() || content.trim().length < 10) {
      setError('Please paste or type at least 10 characters of the suspicious message or offer.');
      return;
    }
    setError('');
    onScan(content.trim(), analysisType);
  };

  const loadDemo = (scenarioId: string) => {
    const demo = DEMO_SCENARIOS.find(d => d.id === scenarioId);
    if (demo) {
      setContent(demo.content);
      setError('');
    }
  };

  return (
    <form onSubmit={handleScan} className="space-y-4">
      {/* Quick Demo Pre-fills */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Quick Presets:
        </span>
        <button
          type="button"
          onClick={() => loadDemo('demo-job-fee')}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
        >
          <Briefcase className="h-3 w-3" /> Fake Job (UPI Fee)
        </button>
        <button
          type="button"
          onClick={() => loadDemo('demo-rental-trap')}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <Home className="h-3 w-3" /> Rental Deposit Trap
        </button>
        <button
          type="button"
          onClick={() => loadDemo('demo-legitimate-offer')}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <FileCheck2 className="h-3 w-3" /> Legitimate Offer
        </button>
        {content && (
          <button
            type="button"
            onClick={() => { setContent(''); setError(''); }}
            className="ml-auto text-xs font-mono text-slate-400 hover:text-slate-200 flex items-center gap-1"
          >
            <RotateCcw className="h-3 w-3" /> Clear
          </button>
        )}
      </div>

      {/* Main Textarea Container */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#080c14]/80 p-1 shadow-inner focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(0,245,255,0.15)] transition-all">
        <textarea
          rows={7}
          value={content}
          onKeyDown={(e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
              e.preventDefault();
              handleScan();
            }
          }}
          onChange={(e) => {
            setContent(e.target.value);
            if (error) setError('');
          }}
          placeholder="Paste a job offer, appointment letter, recruiter message, rental message, payment request, email, or suspicious text..."
          className="w-full resize-y rounded-xl bg-transparent p-4 text-sm font-mono text-slate-100 placeholder:text-slate-400 focus:outline-none leading-relaxed"
        />

        {/* Bottom toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80 px-4 py-3 bg-slate-900/40 rounded-b-xl">
          {/* Analysis Type Select */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-xs font-mono text-slate-400">Analysis Mode:</span>
            <select
              value={analysisType}
              onChange={(e) => setAnalysisType(e.target.value)}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-mono text-cyan-300 focus:border-cyan-500 focus:outline-none"
            >
              <option value="AUTO_DETECT">⚡ Auto Detect Mode</option>
              <option value="JOB_OFFER">💼 Job Offer / Appointment</option>
              <option value="RENTAL_DEPOSIT">🏠 Rental / Deposit Inquiry</option>
              <option value="RECRUITER_MESSAGE">👤 Recruiter Outreach</option>
              <option value="PAYMENT_REQUEST">💳 Payment / Advance Fee</option>
              <option value="GENERAL_PHISHING">🎣 Phishing / Credential Trap</option>
            </select>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
            <span className="hidden md:inline text-[11px] text-slate-500">
              <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Ctrl</kbd> + <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Enter</kbd> to scan
            </span>
            <span>{content.length.toLocaleString()} chars</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Primary Action Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(0,245,255,0.3)] hover:shadow-[0_0_35px_rgba(0,245,255,0.5)] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
        <span>{isLoading ? 'ANALYZING THREAT SIGNALS...' : 'SCAN FOR THREATS'}</span>
      </button>
    </form>
  );
}
