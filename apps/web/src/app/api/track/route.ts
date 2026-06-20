import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  try {
    const { refCode, eventType = 'visit' } = await request.json();

    if (!refCode) {
      return NextResponse.json({ error: 'Referral code required' }, { status: 400 });
    }

    const ip = request.headers.get('cf-connecting-ip') || 'unknown';

    // In production with KV: store the visit with attribution
    // For now, return success with the ref code info
    return NextResponse.json({
      success: true,
      tracked: true,
      refCode,
      eventType,
      timestamp: new Date().toISOString(),
      ip: ip.slice(0, 8) + '***', // partial IP for dedup
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Tracking failed' },
      { status: 500 }
    );
  }
}
