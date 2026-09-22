import { NextRequest, NextResponse } from 'next/server';
import { ScanRequestSchema } from '@/lib/validation/schemas';
import { RuleBasedAnalyzer } from '@/lib/rules/rule-analyzer';
import { UrlAnalyzer } from '@/lib/url/url-analyzer';
import { GeminiAnalysisService } from '@/lib/ai/gemini-service';
import { ThreatScoringEngine } from '@/lib/scoring/scoring-engine';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { hashContent, createSafePreview } from '@/lib/security/input-sanitizer';
import { prisma } from '@/lib/db/prisma';
import { scanResultCache } from '@/lib/cache/memory-cache';
import { ScanResultPayload, VerificationChecklistItem, ThreatScoresBreakdown, ScanFindingItem, ScanType } from '@/types';

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
    const parseResult = ScanRequestSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: 'Validation failed',
          details: parseResult.error.errors.map(e => e.message).join(', '),
        },
        { status: 400 }
      );
    }

    const { content, analysisType, scanType } = parseResult.data;
    const contentHash = hashContent(content);
    const safePreview = createSafePreview(content);

    // Fast-path in-memory cache hit
    const cachedPayload = scanResultCache.get(contentHash) as ScanResultPayload | undefined;
    if (cachedPayload) {
      return NextResponse.json(cachedPayload, {
        headers: {
          'X-Cache': 'HIT',
          'X-Response-Time-Ms': String(Date.now() - startTime),
        },
      });
    }

    // 2. Stage A: Deterministic Rule Analysis & Entity Extraction
    const ruleAnalyzer = new RuleBasedAnalyzer();
    const ruleOutput = ruleAnalyzer.analyze(content, analysisType);

    // 3. Stage B & C: Parallelize embedded URL forensics & Gemini semantic AI analysis
    const urlMatches = content.match(/https?:\/\/[^\s"'<>]+/gi) || [];
    const urlAnalyzer = new UrlAnalyzer();
    const geminiService = new GeminiAnalysisService();

    const [embeddedUrlResults, aiOutput] = await Promise.all([
      Promise.all(
        urlMatches.slice(0, 3).map(async (rawFoundUrl) => {
          try {
            const urlRes = await urlAnalyzer.analyzeUrl(rawFoundUrl);
            return {
              risk: urlRes.riskScore,
              findings: urlRes.detectedRedFlags,
            };
          } catch {
            return {
              risk: 30,
              findings: [
                {
                  category: 'URL_ANOMALY' as const,
                  severity: 'MEDIUM' as const,
                  title: 'Suspicious or Blocked Embedded Link',
                  evidence: rawFoundUrl,
                  explanation: 'The link contains invalid syntax or targets internal/restricted network addresses.',
                  recommendedAction: 'Do not click on unverified links embedded in messages.',
                },
              ],
            };
          }
        })
      ),
      geminiService.analyzeText(content, ruleOutput.detectedCategory),
    ]);

    let embeddedUrlRisk = 0;
    const embeddedUrlFindings: ScanFindingItem[] = [];
    for (const r of embeddedUrlResults) {
      embeddedUrlRisk = Math.max(embeddedUrlRisk, r.risk);
      embeddedUrlFindings.push(...r.findings);
    }

    // Combine findings from rules, embedded URLs, and AI
    const allFindingsMap = new Map<string, ScanFindingItem>();
    
    // Add deterministic rule findings
    for (const f of ruleOutput.findings) {
      allFindingsMap.set(f.title, f);
    }
    // Add URL findings
    for (const f of embeddedUrlFindings) {
      allFindingsMap.set(f.title, f);
    }
    // Add AI findings
    for (const f of aiOutput.redFlags) {
      if (!allFindingsMap.has(f.title)) {
        allFindingsMap.set(f.title, f);
      }
    }
    const combinedFindings = Array.from(allFindingsMap.values());

    // 5. Stage D: Multi-Factor Threat Scoring
    const scoringEngine = new ThreatScoringEngine();

    // Determine sub-scores
    const textRisk = Math.max(ruleOutput.overallTextRiskScore, aiOutput.classification === 'CRITICAL' ? 85 : aiOutput.classification === 'HIGH_RISK' ? 70 : 15);
    const paymentRisk = ruleOutput.paymentRiskScore;
    const urlRisk = embeddedUrlRisk;
    const domainRisk = embeddedUrlRisk > 50 ? 50 : 10;
    const identityRisk = Math.max(ruleOutput.phishingRiskScore, ruleOutput.findings.some(f => f.category === 'PHISHING') ? 75 : 0);
    const urgencyRisk = ruleOutput.urgencyRiskScore;

    const breakdown: ThreatScoresBreakdown = {
      textRisk,
      paymentRisk,
      urlRisk,
      domainRisk,
      identityRisk,
      urgencyRisk,
    };

    const { score: threatScore, riskLevel, confidence } = scoringEngine.calculateScore(breakdown);

    // 6. Verification Checklist generation
    const checklist: VerificationChecklistItem[] = [
      {
        id: 'chk-1',
        text: 'Verify the company or property owner through an official published website, not numbers in this message',
        checked: false,
        category: 'IDENTITY',
      },
      {
        id: 'chk-2',
        text: 'Confirm that NO upfront fees, registration charges, or equipment purchases are requested',
        checked: false,
        category: 'PAYMENT',
      },
      {
        id: 'chk-3',
        text: 'Verify the email domain matches the exact corporate domain (not free webmail like @gmail.com)',
        checked: false,
        category: 'DOMAIN',
      },
      {
        id: 'chk-4',
        text: 'Never share OTPs, banking passwords, PINs, or sensitive identity documents',
        checked: false,
        category: 'IDENTITY',
      },
      {
        id: 'chk-5',
        text: 'Perform an independent physical walk-through or video interview before transferring any funds',
        checked: false,
        category: 'GENERAL',
      },
      {
        id: 'chk-6',
        text: 'Check employer reviews and recruitment warnings on Glassdoor, LinkedIn, or community forums',
        checked: false,
        category: 'LEGAL',
      },
    ];

    // 7. Persist to Database (with safe fallback if DB is not yet migrated or unreachable)
    const scanId = `scan_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    try {
      await prisma.scan.create({
        data: {
          id: scanId,
          scanType,
          threatScore,
          riskLevel,
          confidence,
          inputHash: contentHash,
          inputPreview: safePreview,
          summary: aiOutput.summary,
          isOfflineFallback: aiOutput.isFallback || false,
          findings: {
            create: combinedFindings.map(f => ({
              category: f.category,
              severity: f.severity,
              title: f.title,
              evidence: f.evidence,
              explanation: f.explanation,
              recommendedAction: f.recommendedAction,
            })),
          },
          entities: {
            create: ruleOutput.entities.map(e => ({
              entityType: e.entityType,
              value: e.value,
              riskScore: e.riskScore || 0,
            })),
          },
        },
      });
    } catch (dbError) {
      console.warn('Database write bypassed (transient or development DB setup):', dbError);
    }

    const payload: ScanResultPayload = {
      id: scanId,
      scanType: scanType as ScanType,
      threatScore,
      riskLevel,
      confidence,
      inputPreview: safePreview,
      summary: aiOutput.summary,
      isOfflineFallback: aiOutput.isFallback || false,
      createdAt: new Date().toISOString(),
      breakdown,
      findings: combinedFindings,
      entities: ruleOutput.entities,
      domainCheck: null,
      positiveSignals: aiOutput.positiveSignals,
      recommendedActions: aiOutput.recommendedActions,
      verificationChecklist: checklist,
    };

    scanResultCache.set(contentHash, payload);

    return NextResponse.json(payload, {
      headers: {
        'X-Cache': 'MISS',
        'X-Response-Time-Ms': String(Date.now() - startTime),
      },
    });
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.error('Scan API handler exception:', error);
    return NextResponse.json(
      {
        error: 'An internal error occurred while analyzing the content.',
        message: err?.message || 'Unknown error',
      },
      { status: 500 }
    );
  }
}
