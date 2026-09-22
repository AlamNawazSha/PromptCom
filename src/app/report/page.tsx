'use client';

import React, { useState } from 'react';
import { Printer, ShieldAlert, FileText, CheckCircle2, Download } from 'lucide-react';
import { RiskBadge } from '@/components/threat-meter/risk-badge';

export default function ReportPage() {
  const [reportData, setReportData] = useState({
    reportId: `REP-${Date.now().toString().slice(-6)}`,
    date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
    target: 'Vertex Technologies Offer Letter & Onboarding Demand',
    threatScore: 78,
    riskLevel: 'HIGH_RISK' as const,
    confidence: 94,
    summary: 'High risk detected. The communication demands an upfront refundable equipment and registration fee of ₹18,500 via personal UPI handle within an artificial 2-hour window. Legitimate employers never collect recruitment or hardware dispatch fees.',
    indicators: [
      {
        title: 'Upfront Registration Fee Demand',
        severity: 'HIGH',
        evidence: '...pay a refundable equipment and registration fee of ₹18,500 within 2 hours...',
        explanation: 'Mandatory payments for pre-employment onboarding or equipment dispatch are a definitive hallmark of employment advance-fee scams.',
      },
      {
        title: 'Direct Personal UPI Handle',
        severity: 'HIGH',
        evidence: '...UPI to hr.vertextech@okaxis...',
        explanation: 'Payment routed to a personal UPI VPA handle rather than a verified corporate escrow/merchant account.',
      },
      {
        title: 'Artificial Time Pressure',
        severity: 'MEDIUM',
        evidence: '...within 2 hours. Offer expires at 5:00 PM today...',
        explanation: 'Urgency tactics engineered to prevent candidates from verifying credentials with mentors or fraud databases.',
      },
    ],
    checklist: [
      'Confirm company exists on official government registrar portal',
      'Verify HR email matches corporate domain (not free webmail)',
      'Refuse any advance payment demands',
      'Contact published enterprise switchboard phone number',
    ],
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      {/* Top Action Bar (hidden in print) */}
      <div className="flex items-center justify-between no-print border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-mono font-bold text-white flex items-center gap-2">
            <FileText className="h-5 w-5 text-cyan-400" />
            <span>EXECUTIVE SECURITY ANALYSIS DOSSIER</span>
          </h1>
          <p className="text-xs font-mono text-slate-400">
            Print-optimized forensic threat report suitable for legal review and bank dispute filing.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="flex items-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 px-4 py-2 font-mono text-xs font-bold text-slate-950 transition-colors shadow-lg"
        >
          <Printer className="h-4 w-4" />
          <span>Print / Export PDF</span>
        </button>
      </div>

      {/* Formal Printable Report Paper */}
      <div className="rounded-2xl border border-slate-800 bg-[#090d16] p-8 sm:p-12 shadow-2xl space-y-8 font-sans print:border-none print:p-0 print:text-black">
        {/* Dossier Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b border-slate-800 pb-6 gap-4 print:border-b-2 print:border-black">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 flex items-center justify-center print:border-black">
              <ShieldAlert className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-black font-mono tracking-wider text-white print:text-black">
                SCAMSHIELD AI
              </h2>
              <p className="text-[11px] font-mono text-cyan-400 print:text-black uppercase tracking-wider">
                Digital Forensics & Phishing Investigation Report
              </p>
            </div>
          </div>

          <div className="text-right text-xs font-mono text-slate-400 print:text-black space-y-0.5">
            <div><strong>Report Ref:</strong> {reportData.reportId}</div>
            <div><strong>Date:</strong> {reportData.date}</div>
            <div><strong>Classification:</strong> OFFICIAL SECURITY AUDIT</div>
          </div>
        </div>

        {/* Executive Overview Box */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-xl border border-slate-800 bg-slate-900/50 p-5 print:border print:bg-gray-50 print:text-black">
          <div className="sm:col-span-2 space-y-2">
            <span className="text-[10px] font-mono uppercase text-slate-400 print:text-black block">Target Analyzed</span>
            <p className="text-sm font-bold text-white print:text-black">{reportData.target}</p>
            <span className="text-[10px] font-mono uppercase text-slate-400 print:text-black block mt-2">Executive Summary</span>
            <p className="text-xs text-slate-300 print:text-black leading-relaxed font-mono">{reportData.summary}</p>
          </div>

          <div className="flex flex-col items-center justify-center border-t sm:border-t-0 sm:border-l border-slate-800 pt-4 sm:pt-0 sm:pl-4 print:border-black text-center">
            <span className="text-[10px] font-mono uppercase text-slate-400 print:text-black mb-1">Scam Threat Index</span>
            <span className="text-5xl font-black font-mono text-orange-400 print:text-black">{reportData.threatScore}%</span>
            <div className="mt-2">
              <RiskBadge level={reportData.riskLevel} size="md" />
            </div>
            <span className="text-[10px] font-mono text-slate-400 print:text-black mt-2">Confidence: {reportData.confidence}%</span>
          </div>
        </div>

        {/* Forensic Findings */}
        <div className="space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 pb-2">
            Identified Threat Red Flags
          </h3>
          <div className="space-y-3">
            {reportData.indicators.map((ind, i) => (
              <div key={i} className="rounded-xl border border-slate-800 p-4 print:border print:text-black space-y-1">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="font-bold text-white print:text-black">{ind.title}</span>
                  <span className="text-orange-400 font-bold uppercase">{ind.severity} RISK</span>
                </div>
                <p className="text-xs italic text-amber-300/90 print:text-gray-800 font-mono">
                  Evidence: "{ind.evidence}"
                </p>
                <p className="text-xs text-slate-300 print:text-black">
                  {ind.explanation}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Verification Checklist */}
        <div className="space-y-3">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400 print:text-black border-b border-slate-800 pb-2">
            Recommended Action Directives
          </h3>
          <ul className="space-y-1.5 text-xs font-mono text-slate-300 print:text-black">
            {reportData.checklist.map((c, i) => (
              <li key={i} className="flex items-center gap-2">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                <span>{c}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Legal Disclaimer Footer */}
        <div className="border-t border-slate-800 pt-4 text-[10px] font-mono text-slate-400 print:text-black leading-relaxed">
          <p>
            <strong>LEGAL DISCLAIMER:</strong> This report is generated automatically by the ScamShield AI Forensic Engine. While engineered to identify social engineering indicators, no automated diagnostic can guarantee absolute legitimacy. This report is provided for informational and due-diligence purposes only.
          </p>
        </div>
      </div>
    </div>
  );
}
