'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ScanResultView } from '@/components/results/scan-result-view';
import { ScanResultPayload } from '@/types';
import { ArrowLeft, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function SingleScanPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [scan, setScan] = useState<ScanResultPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;

    const fetchScan = async () => {
      setIsLoading(true);
      setError('');
      try {
        const res = await fetch(`/api/scans/${id}`);
        const data = await res.json();
        if (!res.ok || !data.scan) {
          throw new Error(data.error || 'Scan record could not be found');
        }

        const s = data.scan;
        const payload: ScanResultPayload = {
          id: s.id,
          scanType: s.scanType,
          threatScore: s.threatScore,
          riskLevel: s.riskLevel,
          confidence: s.confidence,
          inputPreview: s.inputPreview,
          rawUrl: s.rawUrl,
          domain: s.domain,
          summary: s.summary,
          isOfflineFallback: s.isOfflineFallback,
          createdAt: s.createdAt,
          breakdown: {
            textRisk: s.threatScore,
            paymentRisk: s.threatScore >= 60 ? 70 : 10,
            urlRisk: s.scanType === 'URL' ? s.threatScore : 10,
            domainRisk: s.domainCheck ? 40 : 10,
            identityRisk: 20,
            urgencyRisk: 20,
          },
          findings: s.findings || [],
          entities: s.entities || [],
          domainCheck: s.domainCheck || null,
          positiveSignals: [],
          recommendedActions: [
            'Do NOT transfer advance fees or registration amounts.',
            'Verify the employer directly through their published official contact channels.',
          ],
          verificationChecklist: [
            {
              id: 'chk-1',
              text: 'Verify company through official website directory',
              checked: false,
              category: 'IDENTITY',
            },
            {
              id: 'chk-2',
              text: 'Confirm no pre-joining payment is required',
              checked: false,
              category: 'PAYMENT',
            },
          ],
        };

        setScan(payload);
      } catch (err: any) {
        setError(err.message || 'Failed to load scan');
      } finally {
        setIsLoading(false);
      }
    };

    fetchScan();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-8 w-8 text-cyan-400 animate-spin" />
        <p className="text-xs font-mono text-slate-400">Loading forensic scan report...</p>
      </div>
    );
  }

  if (error || !scan) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center space-y-4">
        <AlertCircle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-mono font-bold text-white">Record Not Found</h2>
        <p className="text-xs text-slate-400 font-mono">{error || 'This scan ID does not exist or has been deleted.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 font-mono text-xs font-bold text-slate-950 hover:bg-cyan-400 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Return to Scanner</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-6">
      <Link
        href="/history"
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Audit Log</span>
      </Link>

      <ScanResultView result={scan} />
    </div>
  );
}
