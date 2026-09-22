'use client';

import React, { useState, useRef } from 'react';
import { FileUp, FileText, CheckCircle2, AlertCircle, ShieldAlert, X } from 'lucide-react';

interface DocumentScannerProps {
  onScan: (content: string, category: string, documentName: string) => void;
  isLoading: boolean;
}

export function DocumentScanner({ onScan, isLoading }: DocumentScannerProps) {
  const [file, setFile] = useState<File | null>(null);
  const [extractedText, setExtractedText] = useState('');
  const [error, setError] = useState('');
  const [isReading, setIsReading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Check size limit: 5MB
    if (selectedFile.size > 5 * 1024 * 1024) {
      setError('File exceeds maximum supported size (5MB). Please upload a smaller document.');
      return;
    }

    setFile(selectedFile);
    setError('');
    setIsReading(true);

    try {
      if (selectedFile.type.includes('text') || selectedFile.name.endsWith('.txt') || selectedFile.name.endsWith('.md')) {
        const text = await selectedFile.text();
        setExtractedText(text);
      } else {
        // For PDF or other documents, extract text or parse as text stream
        const text = await selectedFile.text();
        // Clean binary noise if raw PDF is read as text
        const cleaned = text.replace(/[\x00-\x08\x0E-\x1F\x7F-\x9F]/g, ' ').replace(/\s+/g, ' ');
        if (cleaned.length > 20) {
          setExtractedText(cleaned);
        } else {
          setExtractedText(`[DOCUMENT: ${selectedFile.name}]\nDocument uploaded for forensic inspection. Size: ${(selectedFile.size / 1024).toFixed(1)} KB.`);
        }
      }
    } catch (err: any) {
      setError('Failed to extract text from document. Please ensure the file is not corrupted.');
    } finally {
      setIsReading(false);
    }
  };

  const handleScan = () => {
    if (!extractedText.trim() && !file) {
      setError('Please select an offer letter or appointment document to inspect.');
      return;
    }
    const contentToScan = extractedText.trim() || `Forensic inspection of document: ${file?.name}`;
    onScan(contentToScan, 'JOB_OFFER', file?.name || 'document.pdf');
  };

  const clearFile = () => {
    setFile(null);
    setExtractedText('');
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Upload Drag & Drop Area */}
      {!file ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-700/80 bg-[#080c14]/80 p-8 text-center hover:border-cyan-500/50 hover:bg-[#0c121e]/90 cursor-pointer transition-all"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".txt,.pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 group-hover:scale-110 group-hover:shadow-[0_0_20px_rgba(0,245,255,0.3)] transition-all mb-4">
            <FileUp className="h-7 w-7" />
          </div>
          <h3 className="text-sm font-mono font-bold text-white mb-1">
            Upload Appointment Letter or Rental Agreement
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mb-3">
            Drag & drop your PDF, DOCX, or TXT document here, or click to browse. Max size 5MB.
          </p>
          <div className="flex items-center gap-2 text-[11px] font-mono text-cyan-400/80">
            <span>• Client-Side Pre-Parsed</span>
            <span>• Instant Indicator Extraction</span>
          </div>
        </div>
      ) : (
        /* Selected File Card */
        <div className="rounded-2xl border border-cyan-500/30 bg-[#080c14] p-5 shadow-[0_0_20px_rgba(0,245,255,0.1)]">
          <div className="flex items-start justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-mono font-bold text-white">{file.name}</p>
                <p className="text-xs font-mono text-slate-400">
                  {(file.size / 1024).toFixed(1)} KB • Ready for security parsing
                </p>
              </div>
            </div>
            <button
              onClick={clearFile}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Extracted text preview */}
          {extractedText && (
            <div className="mt-3">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">
                Extracted Document Preview:
              </span>
              <div className="max-h-32 overflow-y-auto rounded-lg bg-slate-900/60 p-3 text-xs font-mono text-slate-300 border border-slate-800">
                {extractedText.slice(0, 500)}
                {extractedText.length > 500 && '...'}
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-xs font-mono text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl px-4 py-2.5">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button
        onClick={handleScan}
        disabled={isLoading || !file}
        className="w-full group relative flex items-center justify-center gap-2 overflow-hidden rounded-xl bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 px-8 py-4 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[0_0_25px_rgba(0,245,255,0.3)] hover:shadow-[0_0_35px_rgba(0,245,255,0.5)] active:scale-[0.99] transition-all disabled:opacity-50"
      >
        <span className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
        <ShieldAlert className="h-5 w-5 text-white animate-pulse" />
        <span>{isLoading ? 'ANALYZING DOCUMENT THREATS...' : 'SCAN DOCUMENT FOR THREATS'}</span>
      </button>
    </div>
  );
}
