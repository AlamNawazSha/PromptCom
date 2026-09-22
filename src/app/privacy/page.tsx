'use client';

import React, { useState } from 'react';
import { Lock, Trash2, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function PrivacyPage() {
  const [deleted, setDeleted] = useState(false);
  const [loading, setLoading] = useState(false);

  const purgeAllHistory = async () => {
    if (!confirm('Are you sure you want to permanently delete all scan records from the database?')) {
      return;
    }
    setLoading(true);
    try {
      // Fetch scans list and delete them
      const res = await fetch('/api/scans?limit=100');
      const data = await res.json();
      if (data.scans && Array.isArray(data.scans)) {
        for (const scan of data.scans) {
          await fetch(`/api/scans/${scan.id}`, { method: 'DELETE' });
        }
      }
      setDeleted(true);
      setTimeout(() => setDeleted(false), 4000);
    } catch (err) {
      console.error('Purge failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300">
          <span>DATA TRANSPARENCY & RETENTION</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Privacy Policy & Data Handling
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          We believe in strict data minimization, cryptographic hashing, and absolute user control over forensic records.
        </p>
      </div>

      <div className="rounded-3xl border border-slate-800 bg-[#080c14]/90 p-8 shadow-xl space-y-6">
        <div className="space-y-3">
          <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
            <Lock className="h-4 w-4 text-cyan-400" />
            <span>1. What Happens to Your Scanned Text?</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            When you submit text into ScamShield AI, the content is evaluated in temporary memory by our deterministic rule analyzer and Google Gemini AI. Raw sensitive texts are not persistently logged in cleartext. Before generating preview summaries in your audit log, payment card numbers, bank accounts, and passwords are encrypted and redacted.
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-emerald-400" />
            <span>2. External AI Processing & Google Gemini</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            If Google Gemini analysis is enabled, submitted evidence snippets are transmitted securely via TLS to Google GenAI endpoints solely for security inference. We recommend redacting personal government IDs, home addresses, or private financial credentials before scanning.
          </p>
        </div>

        <div className="space-y-3 border-t border-slate-800 pt-6">
          <h2 className="text-base font-mono font-bold text-white flex items-center gap-2">
            <Trash2 className="h-4 w-4 text-rose-400" />
            <span>3. Instant Data Purge (Right to Erasure)</span>
          </h2>
          <p className="text-xs text-slate-300 leading-relaxed font-sans">
            You maintain full sovereignty over your scan audit log. You can delete individual scans at any time from the Audit Log page, or trigger a full purge of all historical scans using the button below.
          </p>

          <div className="pt-2">
            <button
              onClick={purgeAllHistory}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 hover:bg-rose-500/20 px-5 py-2.5 font-mono text-xs font-bold text-rose-300 transition-all disabled:opacity-50"
            >
              <Trash2 className="h-4 w-4 text-rose-400" />
              <span>{loading ? 'PURGING AUDIT LOGS...' : 'PURGE ALL SCAN HISTORY'}</span>
            </button>

            {deleted && (
              <p className="text-xs font-mono text-emerald-400 mt-2 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4" />
                <span>All historical scan records have been permanently expunged.</span>
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
