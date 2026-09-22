'use client';

import React, { useState } from 'react';
import { Globe, ShieldAlert, Sparkles, Lock, AlertCircle, Link2 } from 'lucide-react';

interface UrlScannerProps {
  onScan: (url: string) => void;
  isLoading: boolean;
}

export function UrlScanner({ onScan, isLoading }: UrlScannerProps) {
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');

  const handleScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!url.trim() || url.trim().length < 4) {
      setError('Please enter a valid target URL (e.g. https://example.com).');
      return;
    }
    setError('');
    onScan(url.trim());
  };

  return (
    <form onSubmit={handleScan} className="space-y-4">
      {/* Quick URL Presets */}
      <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
        <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider flex items-center gap-1">
          <Sparkles className="h-3 w-3" /> Quick Presets:
        </span>
        <button
          type="button"
          onClick={() => {
            setUrl('https://micros0ft-careers-portal.xyz/login?ref=hr-onboarding');
            setError('');
          }}
          className="rounded-lg border border-rose-500/30 bg-rose-500/10 px-2.5 py-1 text-xs font-medium text-rose-300 hover:bg-rose-500/20 transition-all flex items-center gap-1.5"
        >
          <Link2 className="h-3 w-3" /> Phishing Lookalike (micros0ft.xyz)
        </button>
        <button
          type="button"
          onClick={() => {
            setUrl('http://198.51.100.42/login.php?user=candidate');
            setError('');
          }}
          className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-300 hover:bg-amber-500/20 transition-all flex items-center gap-1.5"
        >
          <Globe className="h-3 w-3" /> Direct IP Host (HTTP)
        </button>
        <button
          type="button"
          onClick={() => {
            setUrl('https://careers.google.com');
            setError('');
          }}
          className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all flex items-center gap-1.5"
        >
          <Lock className="h-3 w-3" /> Legitimate Official Portal
        </button>
      </div>

      {/* URL Input Bar */}
      <div className="relative rounded-2xl border border-slate-800 bg-[#080c14]/80 p-2 shadow-inner focus-within:border-cyan-500/50 focus-within:shadow-[0_0_20px_rgba(0,245,255,0.15)] transition-all">
        <label htmlFor="url-input" className="sr-only">
          Enter target URL or website address for cybersecurity inspection
        </label>
        <div className="flex items-center gap-3 px-3">
          <Globe className="h-5 w-5 text-cyan-400 shrink-0" />
          <input
            id="url-input"
            aria-label="Enter web address or suspicious link"
            type="text"
            value={url}
            onChange={(e) => {
              setUrl(e.target.value);
              if (error) setError('');
            }}
            placeholder="Enter web address or suspicious link (e.g., https://example-careers.xyz)..."
            className="w-full bg-transparent py-3 text-sm font-mono text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
        </div>

        {/* Security badge footer */}
        <div className="flex items-center justify-between border-t border-slate-800/80 px-4 py-2 mt-2 bg-slate-900/40 rounded-b-xl text-[11px] font-mono text-slate-400">
          <span className="flex items-center gap-1 text-cyan-400">
            <Lock className="h-3 w-3" /> SSRF Shield Protected
          </span>
          <span>Private IPs, localhost & cloud metadata endpoints strictly blocked</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Scan Button */}
      <button
        type="submit"
        disabled={isLoading}
        className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(0,245,255,0.3)] hover:shadow-[0_0_35px_rgba(0,245,255,0.5)] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
        <span>{isLoading ? 'ANALYZING DOMAIN INTELLIGENCE...' : 'INSPECT URL & DOMAIN'}</span>
      </button>
    </form>
  );
}
