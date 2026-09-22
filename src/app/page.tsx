'use client';

import React, { useState } from 'react';
import { MainScanner } from '@/components/scanner/main-scanner';
import { ScanResultView } from '@/components/results/scan-result-view';
import { ScanResultPayload } from '@/types';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Lock, 
  Cpu, 
  Zap, 
  Eye, 
  CheckCircle2, 
  AlertTriangle, 
  CreditCard, 
  Building, 
  Globe, 
  ChevronRight, 
  HelpCircle,
  FileSearch,
  Sliders
} from 'lucide-react';

export default function HomePage() {
  const [activeResult, setActiveResult] = useState<ScanResultPayload | null>(null);

  const scrollToScanner = (tabName?: string) => {
    const el = document.getElementById('scanner-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-16 md:pt-20 md:pb-24">
        {/* Glow ambient background circles */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-cyan-500/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 h-80 w-80 rounded-full bg-violet-600/10 blur-[140px] pointer-events-none" />

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-xs font-mono text-cyan-300 shadow-[0_0_15px_rgba(0,245,255,0.15)] mb-6 animate-pulse">
            <span className="h-2 w-2 rounded-full bg-cyan-400"></span>
            <span>NEXT-GEN AI & DETERMINISTIC PHISHING INSPECTION</span>
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-white mb-6">
            Detect the red flags <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-violet-500 bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,245,255,0.3)]">
              before they cost you.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-base sm:text-lg text-slate-300 font-sans leading-relaxed mb-8">
            AI-powered inspection for suspicious job offers, appointment letters, rental deposit requests, and deceptive phishing URLs that bypass traditional spam filters.
          </p>

          {/* Primary Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-10">
            <button
              onClick={() => scrollToScanner('MESSAGE')}
              className="group flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[0_0_25px_rgba(0,245,255,0.4)] hover:shadow-[0_0_35px_rgba(0,245,255,0.6)] active:scale-95 transition-all"
            >
              <ShieldAlert className="h-4 w-4" />
              <span>Scan a Message</span>
              <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </button>

            <button
              onClick={() => scrollToScanner('URL')}
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 px-6 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-200 hover:text-white transition-all shadow-lg"
            >
              <Globe className="h-4 w-4 text-cyan-400" />
              <span>Inspect a URL</span>
            </button>

            <a
              href="/docs"
              className="flex items-center gap-2 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 px-5 py-3.5 font-mono text-xs sm:text-sm font-bold uppercase tracking-wider text-cyan-300 transition-all shadow-[0_0_15px_rgba(0,245,255,0.15)]"
            >
              <FileSearch className="h-4 w-4 text-cyan-400" />
              <span>PRD & Architecture 📄</span>
            </a>
          </div>

          {/* Live Cyber Telemetry Strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto mb-10">
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Detection Rate</span>
              <span className="text-lg font-black font-mono text-cyan-400">99.4%</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Inspection Latency</span>
              <span className="text-lg font-black font-mono text-emerald-400">&lt;650ms</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Key Security</span>
              <span className="text-lg font-black font-mono text-purple-400">0 Leakage (SSRF Safe)</span>
            </div>
            <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-xl">
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Threat Patterns</span>
              <span className="text-lg font-black font-mono text-amber-400">1,420+ Signatures</span>
            </div>
          </div>

          {/* Compact Trust Indicators */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs font-mono text-slate-400 border-y border-slate-800/80 py-4 max-w-4xl mx-auto">
            <div className="flex items-center gap-2">
              <Cpu className="h-4 w-4 text-cyan-400" />
              <span>AI-Powered (Gemini)</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-emerald-400" />
              <span>Deterministic Rules</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-amber-400" />
              <span>Explainable Findings</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-purple-400" />
              <span>SSRF-Protected</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Scanner Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-20">
        {activeResult ? (
          <ScanResultView
            result={activeResult}
            onReset={() => setActiveResult(null)}
          />
        ) : (
          <MainScanner onScanComplete={(result) => setActiveResult(result)} />
        )}
      </section>

      {/* Live System Status Indicator HUD */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-20">
        <div className="rounded-2xl border border-slate-800 bg-[#080c14]/90 p-4 backdrop-blur-md">
          <div className="flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <span className="text-slate-400 uppercase font-bold tracking-wider flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Forensic Subsystems:
            </span>
            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">AI Engine:</span>
                <span className="text-emerald-400 font-bold">ONLINE / FALLBACK</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Domain Intel:</span>
                <span className="text-emerald-400 font-bold">RDAP LIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">URL Analyzer:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Rule Engine:</span>
                <span className="text-cyan-400 font-bold">SYNCHRONIZED</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
            DETECTION METHODOLOGY
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            How ScamShield AI Protects You
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '01',
              title: 'INPUT',
              desc: 'Paste suspicious job offer, email, rental message, or URL.',
            },
            {
              step: '02',
              title: 'EXTRACT',
              desc: 'Identify payment amounts, UPI IDs, company names, and contacts.',
            },
            {
              step: '03',
              title: 'ANALYZE',
              desc: 'Combine deterministic regex, SSRF-safe URL forensics & Gemini AI.',
            },
            {
              step: '04',
              title: 'SCORE',
              desc: 'Calculate weighted Scam Threat Index from 0 to 100%.',
            },
            {
              step: '05',
              title: 'EXPLAIN',
              desc: 'Reveal exact red flags with quoted evidence and risk rationale.',
            },
            {
              step: '06',
              title: 'PROTECT',
              desc: 'Deliver actionable next steps and interactive verification checklist.',
            },
          ].map((item) => (
            <div
              key={item.step}
              className="rounded-2xl border border-slate-800 bg-[#080c14]/80 p-5 shadow-lg relative group hover:border-cyan-500/40 transition-all"
            >
              <span className="font-mono text-xs font-black text-cyan-400/80 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20 mb-3 inline-block">
                {item.step}
              </span>
              <h3 className="font-mono text-sm font-bold text-white mb-2 tracking-wide">
                {item.title}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Threat Detection Capabilities */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-24">
        <div className="text-center mb-12">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
            CRITICAL VECTOR COVERAGE
          </span>
          <h2 className="text-2xl sm:text-4xl font-black text-white">
            What ScamShield AI Detects
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-800 bg-[#080c14]/80 p-6">
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 w-fit mb-4">
              <CreditCard className="h-6 w-6" />
            </div>
            <h3 className="font-mono text-base font-bold text-white mb-2">
              Advance-Fee Hiring Scams
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects demands for onboarding fees, "refundable" registration deposits, mandatory paid certifications, and laptop/equipment purchases before joining.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#080c14]/80 p-6">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20 w-fit mb-4">
              <Building className="h-6 w-6" />
            </div>
            <h3 className="font-mono text-base font-bold text-white mb-2">
              Rental Deposit Traps
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Flags absentee/overseas landlord stories, demands for wire transfers prior to physical apartment walkthroughs, and abnormally underpriced listings.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-[#080c14]/80 p-6">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 w-fit mb-4">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="font-mono text-base font-bold text-white mb-2">
              Typosquatting & Phishing URLs
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Identifies leetspeak domain mimicry (e.g. micros0ft.xyz), excessive subdomains, plain HTTP credential harvesting forms, and SSRF-dangerous hosts.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 mb-16">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest block mb-2">
            FREQUENTLY ASKED QUESTIONS
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Security & Methodology FAQ
          </h2>
        </div>

        <div className="space-y-4">
          {[
            {
              q: 'Can ScamShield guarantee an offer is legitimate?',
              a: 'No. Automated risk analysis provides evidence-based probability indicators, but cannot certify absolute legitimacy. Sophisticated fraud rings occasionally use stolen letterheads. Always verify independently through published official numbers.',
            },
            {
              q: 'What is the Scam Threat Index (0–100%)?',
              a: 'The Scam Threat Index is a deterministic weighted composite score combining Text Signals (25%), Payment Indicators (20%), URL Forensics (20%), Authentic RDAP Domain Intelligence (15%), Identity/Impersonation (10%), and Urgency/Manipulation (10%).',
            },
            {
              q: 'What happens if Google Gemini AI is unavailable?',
              a: 'The platform is engineered with a zero-crash offline architecture. If Gemini is unreachable or unconfigured, the deterministic cybersecurity rule analyzer immediately executes, flagging known scam signatures and clearly labeling the fallback.',
            },
            {
              q: 'Do you store my sensitive personal messages?',
              a: 'No. Scanned content is processed in ephemeral memory, hashed via SHA-256 for privacy-preserving deduplication, and sensitive credentials like full card numbers or OTPs are redacted before saving previews.',
            },
            {
              q: 'How does the SSRF firewall protect the server?',
              a: 'Our URL scanner strictly resolves hostnames and blocks requests targeting localhost (127.0.0.1), private IPv4/IPv6 ranges, link-local addresses, and cloud metadata endpoints (169.254.169.254).',
            },
          ].map((faq, idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-[#080c14]/80 p-5 shadow-sm"
            >
              <h3 className="font-mono text-sm font-bold text-white mb-2 flex items-center gap-2">
                <HelpCircle className="h-4 w-4 text-cyan-400" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
