import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('q') || '';
  const risk = searchParams.get('risk') || '';
  const type = searchParams.get('type') || '';
  const limit = Math.min(Number(searchParams.get('limit') || 50), 100);

  try {
    const whereClause: any = {};

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

    const scans = await prisma.scan.findMany({
      where: whereClause,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        findings: true,
        entities: true,
        domainCheck: true,
      },
    });

    // Compute metrics
    const totalScans = await prisma.scan.count();
    const highRiskScans = await prisma.scan.count({
      where: { riskLevel: 'HIGH_RISK' },
    });
    const criticalScans = await prisma.scan.count({
      where: { riskLevel: 'CRITICAL' },
    });
    const urlScans = await prisma.scan.count({
      where: { scanType: 'URL' },
    });

    const avgScoreAgg = await prisma.scan.aggregate({
      _avg: { threatScore: true },
    });

    return NextResponse.json({
      success: true,
      scans,
      metrics: {
        totalScans,
        highRiskScans,
        criticalScans,
        urlScans,
        avgThreatScore: Math.round(avgScoreAgg._avg.threatScore || 0),
      },
    });
  } catch (error: any) {
    console.warn('Scan history database query failed, returning fallback in-memory response:', error?.message);
    // If DB is uninitialized or empty, return empty list gracefully
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
