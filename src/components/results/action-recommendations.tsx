import React from 'react';
import { Ban, ShieldAlert, Globe, Lock, AlertOctagon, HelpCircle, PhoneCall } from 'lucide-react';
import { RiskLevel } from '@/types';

interface ActionRecommendationsProps {
  riskLevel: RiskLevel;
  actions: string[];
}

export function ActionRecommendations({ riskLevel, actions }: ActionRecommendationsProps) {
  const isHighOrCritical = riskLevel === 'HIGH_RISK' || riskLevel === 'CRITICAL';

  return (
    <div className="rounded-2xl border border-slate-800 bg-[#090e17]/80 p-5 shadow-lg backdrop-blur-md">
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
        <ShieldAlert className="h-5 w-5 text-cyan-400" />
        <h4 className="font-mono text-xs font-bold uppercase tracking-wider text-white">
          What Should I Do Now? (Actionable Protection Guide)
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
        {/* DO NOT PAY Card */}
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-rose-400 font-mono text-xs font-bold uppercase">
            <Ban className="h-4 w-4" />
            <span>1. DO NOT TRANSFER FUNDS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Do not send money, security deposits, registration fees, or equipment reimbursement under any circumstances until independently confirmed.
          </p>
        </div>

        {/* VERIFY EMPLOYER Card */}
        <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-mono text-xs font-bold uppercase">
            <Globe className="h-4 w-4" />
            <span>2. INDEPENDENT VERIFICATION</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Open the organization's official website manually in a new tab. Contact their published HR or front office phone number to verify the offer.
          </p>
        </div>

        {/* PROTECT IDENTITY Card */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-amber-400 font-mono text-xs font-bold uppercase">
            <Lock className="h-4 w-4" />
            <span>3. GUARD SENSITIVE CREDENTIALS</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Never share one-time passwords (OTPs), netbanking credentials, ATM PINs, or high-resolution photos of government IDs.
          </p>
        </div>

        {/* IF ALREADY PAID Card */}
        <div className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-4">
          <div className="flex items-center gap-2 mb-1.5 text-purple-400 font-mono text-xs font-bold uppercase">
            <AlertOctagon className="h-4 w-4" />
            <span>4. IF YOU HAVE ALREADY PAID</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Call your bank or UPI provider fraud helpline immediately to freeze the transaction. File an official cyber fraud complaint at national portals (e.g., cybercrime.gov.in / 1930 Helpline).
          </p>
        </div>
      </div>

      {/* Additional dynamically generated recommendations */}
      {actions && actions.length > 0 && (
        <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-3">
          <span className="text-[11px] font-mono font-bold text-slate-400 uppercase block mb-2">
            Targeted Security Directives:
          </span>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300">
            {actions.map((act, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-cyan-400 font-bold">•</span>
                <span>{act}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
