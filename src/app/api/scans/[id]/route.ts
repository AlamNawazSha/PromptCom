import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    const scan = await prisma.scan.findUnique({
      where: { id },
      include: {
        findings: true,
        entities: true,
        domainCheck: true,
      },
    });

    if (!scan) {
      return NextResponse.json(
        { error: 'Scan record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      scan,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to retrieve scan record', message: error?.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    await prisma.scan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Scan record securely deleted from history.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Failed to delete scan record', message: error?.message },
      { status: 500 }
    );
  }
}
