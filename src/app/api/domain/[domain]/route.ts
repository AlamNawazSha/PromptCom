import { NextRequest, NextResponse } from 'next/server';
import { DomainService } from '@/lib/domain/domain-service';
import { validateSafeUrl } from '@/lib/security/ssrf-guard';

export async function GET(
  req: NextRequest,
  { params }: { params: { domain: string } }
) {
  const { domain } = params;

  if (!domain || domain.length > 255) {
    return NextResponse.json({ error: 'Invalid domain parameter' }, { status: 400 });
  }

  // SSRF validation
  const ssrf = await validateSafeUrl(`https://${domain}`);
  if (!ssrf.isSafe) {
    return NextResponse.json(
      { error: 'Blocked domain', message: ssrf.blockedReason },
      { status: 400 }
    );
  }

  try {
    const domainService = new DomainService();
    const result = await domainService.getDomainIntelligence(domain);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Domain lookup failed', message: error?.message },
      { status: 500 }
    );
  }
}
