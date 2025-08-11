import { NextRequest, NextResponse } from 'next/server';
import { getGmbAuthUrl } from '@/lib/gmb';

export async function GET() {
  try {
    const url = await getGmbAuthUrl();
    return NextResponse.json({ url });
  } catch (error) {
    console.error('GMB connect API error:', error);
    return NextResponse.json(
      { error: 'Failed to get Google My Business auth URL' }, 
      { status: 500 }
    );
  }
} 