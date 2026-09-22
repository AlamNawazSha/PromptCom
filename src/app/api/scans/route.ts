import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { Prisma } from '@prisma/client';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const risk = searchParams.get('risk') || '';
  const type = searchParams.get('type') || '';
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

  try {
    const whereClause: Prisma.ScanWhereInput = {};

    if (risk && risk !== 'ALL') {
      whereClause.riskLevel = risk;
    }
    if (type && type !== 'ALL') {
      whereClause.scanType = type;
    }
    if (search) {
      whereClause.OR = [
        { inputPreview: { contains: search } },
        { domain: { contains: search } },
        { summary: { contains: search } },
      ];
    }

    // Run list query and telemetry aggregations concurrently
    const [scans, totalScans, highRiskScans, criticalScans, urlScans, avgScoreAgg] = await Promise.all([
      prisma.scan.findMany({
        where: whereClause,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          findings: true,
          entities: true,
          domainCheck: true,
        },
      }),
      prisma.scan.count(),
      prisma.scan.count({ where: { riskLevel: 'HIGH_RISK' } }),
      prisma.scan.count({ where: { riskLevel: 'CRITICAL' } }),
      prisma.scan.count({ where: { scanType: 'URL' } }),
      prisma.scan.aggregate({ _avg: { threatScore: true } }),
    ]);

    return NextResponse.json(
      {
        success: true,
        scans,
        metrics: {
          totalScans,
          highRiskScans,
          criticalScans,
          urlScans,
          avgThreatScore: Math.round(avgScoreAgg._avg.threatScore || 0),
        },
      },
      {
        headers: {
          'Cache-Control': 'private, no-cache, no-store, must-revalidate',
        },
      }
    );
  } catch (error: unknown) {
    const err = error as { message?: string };
    console.warn('Scan history database query failed, returning fallback in-memory response:', err?.message);
    return NextResponse.json({
      success: true,
      scans: [],
      metrics: {
        totalScans: 0,
        highRiskScans: 0,
        criticalScans: 0,
        urlScans: 0,
        avgThreatScore: 0,
      },
    });
  }
}
