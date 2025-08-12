import { NextRequest, NextResponse } from 'next/server';
import { createStripeConnectAccount } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await request.json();
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const result = await createStripeConnectAccount(userId);
    
    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ url: result.url });
  } catch (error) {
    console.error('Stripe connect API error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect account' }, 
      { status: 500 }
    );
  }
} 