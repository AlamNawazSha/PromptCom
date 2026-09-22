import { NextRequest, NextResponse } from 'next/server';
import { UrlScanRequestSchema } from '@/lib/validation/schemas';
import { UrlAnalyzer } from '@/lib/url/url-analyzer';
import { DomainService } from '@/lib/domain/domain-service';
import { ThreatScoringEngine } from '@/lib/scoring/scoring-engine';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { hashContent } from '@/lib/security/input-sanitizer';
import { prisma } from '@/lib/db/prisma';
import { scanResultCache } from '@/lib/cache/memory-cache';
import { ScanResultPayload, VerificationChecklistItem, ThreatScoresBreakdown } from '@/types';

export async function POST(req: NextRequest) {
  const startTime = Date.now();
  const clientIp = getClientIp(req);

  // 1. Rate Limiting Check
  const rateLimitResult = checkRateLimit(clientIp);
  if (!rateLimitResult.success) {
    return NextResponse.json(
      {
        error: 'Rate limit exceeded. Please wait a few moments before scanning again.',
        resetMs: rateLimitResult.resetMs,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateLimitResult.resetMs / 1000)),
        },
      }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: 'Invalid JSON payload in request body' },
      { status: 400 }
    );
  }

  try {
    const parseResult = UrlScanRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { url } = parseResult.data;
    const urlHash = hashContent(url);

    // Fast cache hit check
    const cached = scanResultCache.get(urlHash) as ScanResultPayload | undefined;
    if (cached) {
      return NextResponse.json(cached, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time-Ms': String(Date.now() - startTime),
        },
      });
    }

    // 2. Forensics & SSRF Analysis
    const urlAnalyzer = new UrlAnalyzer();
    let forensics;
    try {
      forensics = await urlAnalyzer.analyzeUrl(url);
    } catch (analysisError: any) {
      return NextResponse.json(
        {
          error: 'Security Inspection Blocked',
          message: analysisError.message || 'URL failed security validation (SSRF / invalid syntax).',
        },
        { status: 400 }
      );
    }

    // 3. Domain Intelligence (RDAP & Reputation)
    const domainService = new DomainService();
    const isHttps = forensics.protocol === 'https';
    const domainIntel = await domainService.getDomainIntelligence(forensics.domain, isHttps);
    domainIntel.isPunycode = forensics.isPunycode;
    domainIntel.isSuspiciousTld = forensics.hasSuspiciousTld;
    domainIntel.hasExcessiveSubdomains = forensics.hasExcessiveSubdomains;
    domainIntel.brandMismatch = forensics.matchedBrand;

    // 4. Calculate Sub-Scores
    let domainRisk = 10;
    if (domainIntel.reputationScore === 'HIGH_RISK') domainRisk = 80;
    else if (domainIntel.reputationScore === 'MEDIUM_RISK') domainRisk = 50;
    if (forensics.hasSuspiciousTld) domainRisk = Math.max(domainRisk, 65);
    if (forensics.isPunycode) domainRisk = Math.max(domainRisk, 80);

    const identityRisk = forensics.hasTyposquatting ? 85 : forensics.hasCredentialKeywords ? 60 : 10;
    const urlRisk = forensics.riskScore;

    const breakdown: ThreatScoresBreakdown = {
      textRisk: forensics.hasCredentialKeywords ? 45 : 10,
      paymentRisk: 0,
      urlRisk,
      domainRisk,
      identityRisk,
      urgencyRisk: 10,
    };

    const scoringEngine = new ThreatScoringEngine();
    const { score: threatScore, riskLevel, confidence } = scoringEngine.calculateScore(breakdown);

    // 5. Build explainable summary
    let summary = '';
    if (threatScore >= 80) {
      summary = `Critical risk detected for ${forensics.domain}. Analysis identified severe indicators including ${forensics.detectedRedFlags.map(f => f.title).slice(0, 2).join(' and ')}.`;
    } else if (threatScore >= 60) {
      summary = `High threat index calculated for ${forensics.domain}. Potential phishing, deceptive subdomains, or brand impersonation indicators found.`;
    } else if (threatScore >= 40) {
      summary = `Proceed with caution. The URL for ${forensics.domain} exhibited suspicious characteristics such as insecure protocol or high-risk TLD.`;
    } else {
      summary = `No critical malicious indicators observed for ${forensics.domain}. However, automated inspection cannot guarantee site legitimacy.`;
    }

    // 6. Actionable recommendations
    const recommendedActions: string[] = [];
    if (forensics.hasTyposquatting) {
      recommendedActions.push(`DO NOT enter credentials: This domain mimics ${forensics.matchedBrand}. Visit the official site directly.`);
    }
    if (forensics.protocol === 'http') {
      recommendedActions.push('Do NOT submit passwords or personal information over plain HTTP.');
    }
    if (domainIntel.domainAgeDays !== null && domainIntel.domainAgeDays < 30) {
      recommendedActions.push('Avoid financial transactions with this newly created domain.');
    }
    if (recommendedActions.length === 0) {
      recommendedActions.push('Always verify the full address in your browser address bar before authenticating.');
    }

    // 7. Verification Checklist
    const checklist: VerificationChecklistItem[] = [
      {
        id: 'chk-url-1',
        text: 'Verify the domain name spelling matches the official company web address exactly',
        checked: false,
        category: 'DOMAIN',
      },
      {
        id: 'chk-url-2',
        text: 'Confirm the connection is encrypted with HTTPS and a valid SSL certificate',
        checked: false,
        category: 'GENERAL',
      },
      {
        id: 'chk-url-3',
        text: 'Do not log into accounts through links received in unsolicited emails or SMS',
        checked: false,
        category: 'IDENTITY',
      },
      {
        id: 'chk-url-4',
        text: 'Bookmark known authentic services and access them directly from your browser bookmarks',
        checked: false,
        category: 'GENERAL',
      },
    ];

    const scanId = `scan_url_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const inputHash = hashContent(forensics.normalizedUrl);

    // 8. Persist to DB
    try {
      await prisma.scan.create({
        data: {
          id: scanId,
          scanType: 'URL',
          threatScore,
          riskLevel,
          confidence,
          inputHash,
          inputPreview: forensics.normalizedUrl,
          rawUrl: forensics.normalizedUrl,
          domain: forensics.domain,
          summary,
          isOfflineFallback: false,
          findings: {
            create: forensics.detectedRedFlags.map(f => ({
              category: f.category,
              severity: f.severity,
              title: f.title,
              evidence: f.evidence,
              explanation: f.explanation,
              recommendedAction: f.recommendedAction,
            })),
          },
          domainCheck: {
            create: {
              domain: forensics.domain,
              domainAgeDays: domainIntel.domainAgeDays,
              registrar: domainIntel.registrar,
              registrationDate: domainIntel.registrationDate,
              isHttps: domainIntel.isHttps,
              hasValidCert: domainIntel.hasValidCert,
              reputationScore: domainIntel.reputationScore,
              isSuspiciousTld: domainIntel.isSuspiciousTld,
              isPunycode: domainIntel.isPunycode,
              hasExcessiveSubdomains: domainIntel.hasExcessiveSubdomains,
              brandMismatch: domainIntel.brandMismatch,
            },
          },
        },
      });
    } catch (dbError) {
      console.warn('Database write bypassed for URL scan:', dbError);
    }

    const payload: ScanResultPayload = {
      id: scanId,
      scanType: 'URL',
      threatScore,
      riskLevel,
      confidence,
      inputPreview: forensics.normalizedUrl,
      rawUrl: forensics.normalizedUrl,
      domain: forensics.domain,
      summary,
      isOfflineFallback: false,
      createdAt: new Date().toISOString(),
      breakdown,
      findings: forensics.detectedRedFlags,
      entities: [
        { entityType: 'URL', value: forensics.normalizedUrl, riskScore: urlRisk },
        { entityType: 'COMPANY', value: forensics.domain, riskScore: domainRisk },
      ],
      domainCheck: domainIntel,
      positiveSignals: forensics.protocol === 'https' ? ['Valid HTTPS transport protocol configured'] : [],
      recommendedActions,
      verificationChecklist: checklist,
    };

    scanResultCache.set(urlHash, payload);

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time-Ms': String(Date.now() - startTime),
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('URL scan error:', error);
    return NextResponse.json(
      {
        error: 'An internal error occurred while inspecting the URL.',
        message: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
