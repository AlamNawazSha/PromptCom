import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Lock, ExternalLink, Heart } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-800/80 bg-[#040609] text-slate-400 text-sm">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Col 1: Brand & Tagline */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-cyan-400" />
              <span className="text-lg font-black tracking-wider text-white">SCAMSHIELD AI</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Detect the red flags before they cost you. SCAMSHIELD AI combines deterministic cybersecurity rule engines, SSRF-guarded URL forensics, authentic RDAP domain intelligence, and Google Gemini AI semantic inspection to protect job seekers and renters from financial deception.
            </p>
            <div className="flex items-center gap-4 text-xs font-mono text-cyan-400">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3.5 w-3.5" /> Privacy-Preserving Hashing
              </span>
              <span>•</span>
              <span>SSRF-Protected</span>
              <span>•</span>
              <span>Zero Fabrication</span>
            </div>
          </div>

          {/* Col 2: Security & Analysis */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Inspection Modes
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Job Offer Letter Inspector
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Rental Deposit Trap Detector
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Phishing URL & Typosquatting Analyzer
                </Link>
              </li>
              <li>
                <Link href="/" className="hover:text-cyan-400 transition-colors">
                  Document / PDF Forensic Scan
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-cyan-400 transition-colors">
                  SOC Threat Analytics
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 3: Architecture & Transparency */}
          <div>
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-white mb-3">
              Transparency & Legal
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/about" className="hover:text-cyan-400 transition-colors">
                  How ScamShield Works
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-cyan-400 transition-colors text-cyan-300 font-mono">
                  PRD & System Architecture 📄
                </Link>
              </li>
              <li>
                <Link href="/security" className="hover:text-cyan-400 transition-colors">
                  SSRF & Security Protections
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-cyan-400 transition-colors">
                  Privacy Policy & Data Retention
                </Link>
              </li>
              <li>
                <Link href="/report" className="hover:text-cyan-400 transition-colors">
                  Executive Security Dossier
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Security Disclaimers (Prompt Requirement #41) */}
        <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 text-xs text-amber-300/80 leading-relaxed mb-8">
          <p className="font-semibold text-amber-400 mb-1 flex items-center gap-1.5">
            <span>⚠️</span> AUTOMATED SECURITY ADVISORY & DISCLAIMER
          </p>
          <p>
            This tool provides automated risk analysis and cannot guarantee that a message, website, employer, landlord, or offer is legitimate. Cybercriminals continuously evolve tactics. Do not use this tool as the sole basis for financial or security decisions. Always conduct independent verification via official published contact channels.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} SCAMSHIELD AI. Enterprise Phishing & Fraud Prevention Platform.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="h-3 w-3 text-red-500 fill-red-500" /> for community fraud defense
          </p>
        </div>
      </div>
    </footer>
  );
}
