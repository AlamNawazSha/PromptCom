'use client';

import React, { useState } from 'react';
import { MessageScanner } from './message-scanner';
import { UrlScanner } from './url-scanner';
import { DocumentScanner } from './document-scanner';
import { ScanPipeline } from './scan-pipeline';
import { ScanResultPayload } from '@/types';
import { FileText, Globe, UploadCloud, Shield, CheckCircle2 } from 'lucide-react';

interface MainScannerProps {
  onScanComplete: (result: ScanResultPayload) => void;
}

export function MainScanner({ onScanComplete }: MainScannerProps) {
  const [activeTab, setActiveTab] = useState<'MESSAGE' | 'URL' | 'DOCUMENT'>('MESSAGE');
  const [isScanning, setIsScanning] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleMessageScan = async (content: string, category: string) => {
    setIsScanning(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          analysisType: category,
          scanType: 'TEXT',
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Scan analysis request failed');
      }

      // Add a slight natural delay so user can appreciate the security pipeline progression
      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(data);
      }, 1400);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err.message || 'Inspection failed. Please check your network and try again.');
    }
  };

  const handleUrlScan = async (url: string) => {
    setIsScanning(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/url-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'URL security inspection failed');
      }

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(data);
      }, 1400);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err.message || 'URL inspection failed.');
    }
  };

  const handleDocumentScan = async (content: string, category: string, documentName: string) => {
    setIsScanning(true);
    setErrorMessage('');

    try {
      const res = await fetch('/api/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content,
          analysisType: category,
          scanType: 'DOCUMENT',
          documentName,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || 'Document scan failed');
      }

      setTimeout(() => {
        setIsScanning(false);
        onScanComplete(data);
      }, 1400);
    } catch (err: any) {
      setIsScanning(false);
      setErrorMessage(err.message || 'Document inspection failed.');
    }
  };

  return (
    <div id="scanner-section" className="w-full max-w-4xl mx-auto">
      {/* Scanner Wrapper Box */}
      <div className="rounded-3xl border border-slate-800 bg-[#070b13]/90 backdrop-blur-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Subtle Cyber Glowing Background Accent */}
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-4 mb-6 overflow-x-auto">
          <button
            onClick={() => { setActiveTab('MESSAGE'); setErrorMessage(''); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'MESSAGE'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Message / Offer Letter</span>
          </button>

          <button
            onClick={() => { setActiveTab('URL'); setErrorMessage(''); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'URL'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <Globe className="h-4 w-4" />
            <span>URL / Website</span>
          </button>

          <button
            onClick={() => { setActiveTab('DOCUMENT'); setErrorMessage(''); }}
            className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs sm:text-sm font-mono font-bold tracking-wider uppercase transition-all ${
              activeTab === 'DOCUMENT'
                ? 'bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_15px_rgba(0,245,255,0.2)]'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/50 border border-transparent'
            }`}
          >
            <UploadCloud className="h-4 w-4" />
            <span>Document / PDF</span>
          </button>
        </div>

        {/* Error Alert if any */}
        {errorMessage && (
          <div className="mb-4 rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs font-mono text-rose-300">
            <span className="font-bold">Error:</span> {errorMessage}
          </div>
        )}

        {/* Tab Contents */}
        {isScanning ? (
          <ScanPipeline isScanning={isScanning} />
        ) : (
          <div>
            {activeTab === 'MESSAGE' && (
              <MessageScanner onScan={handleMessageScan} isLoading={isScanning} />
            )}
            {activeTab === 'URL' && (
              <UrlScanner onScan={handleUrlScan} isLoading={isScanning} />
            )}
            {activeTab === 'DOCUMENT' && (
              <DocumentScanner onScan={handleDocumentScan} isLoading={isScanning} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
