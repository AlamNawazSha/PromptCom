import React from 'react';
import { ShieldCheck, AlertTriangle, Eye, Lock, Cpu, Globe, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-mono text-cyan-300">
          <span>MISSION & METHODOLOGY</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white">
          Why We Built ScamShield AI
        </h1>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Protecting vulnerable job seekers and renters from life-altering financial deception and social engineering fraud.
        </p>
      </div>

      {/* The Problem Statement */}
      <div className="rounded-3xl border border-slate-800 bg-[#080c14]/90 p-8 shadow-xl space-y-4">
        <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-rose-500" />
          <span>THE CRISIS: ADVANCE-FEE & RECRUITMENT DECEPTION</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Every year, millions of dollars are stolen from hopeful job candidates and apartment seekers. Scammers impersonate multinational tech corporations, dispatch counterfeit appointment letters on stolen letterhead, and demand ₹15,000 to ₹50,000 in "refundable registration deposits", "laptop courier fees", or "mandatory training clearances".
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Simultaneously, fake rental listings exploit housing shortages by claiming the property owner is deployed abroad, pressuring tenants to wire deposits via UPI before visiting the apartment.
        </p>
      </div>

      {/* Why Traditional Spam Filters Fail */}
      <div className="rounded-3xl border border-slate-800 bg-[#080c14]/90 p-8 shadow-xl space-y-4">
        <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
          <Eye className="h-5 w-5 text-amber-400" />
          <span>WHY TRADITIONAL SPAM FILTERS MISS THESE SCAMS</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          Conventional email spam filters look for known malicious attachments or IP blocklists. However, modern employment and rental scammers bypass these defenses by:
        </p>
        <ul className="space-y-2 text-xs font-mono text-slate-300">
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>Operating over direct messaging apps (WhatsApp, Telegram, LinkedIn InMail) with zero gateway inspection.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>Sending clean text without malware payloads, relying purely on psychological urgency and authority manipulation.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-cyan-400 font-bold">•</span>
            <span>Using fresh disposable domains with valid SSL certificates, tricking basic browser security indicators.</span>
          </li>
        </ul>
      </div>

      {/* Multi-Layered Architecture */}
      <div className="rounded-3xl border border-slate-800 bg-[#080c14]/90 p-8 shadow-xl space-y-4">
        <h2 className="text-lg font-mono font-bold text-white flex items-center gap-2">
          <Cpu className="h-5 w-5 text-cyan-400" />
          <span>HOW SCAMSHIELD AI SOLVES THIS</span>
        </h2>
        <p className="text-sm text-slate-300 leading-relaxed">
          ScamShield AI introduces a hybrid detection pipeline combining high-precision deterministic regex rules, SSRF-safe URL inspection, authentic IANA RDAP domain verification, and Google Gemini AI semantic analysis.
        </p>
        <p className="text-sm text-slate-300 leading-relaxed">
          Unlike black-box AI chatbots, ScamShield provides <strong>explainable findings</strong>—highlighting the exact quoted evidence and teaching users how to spot red flags in the future.
        </p>

        <div className="pt-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-5 py-2.5 font-mono text-xs font-bold text-slate-950 transition-colors"
          >
            <span>Try the Scanner Now</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
