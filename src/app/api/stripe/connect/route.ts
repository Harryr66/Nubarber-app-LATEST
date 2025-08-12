import { NextRequest, NextResponse } from 'next/server';
import { createStripeConnectAccount } from '@/lib/payments';

export async function POST(request: NextRequest) {
  try {
    const { userId, publishableKey } = await request.json();
    
    if (!userId || !publishableKey) {
      return NextResponse.json({ error: 'User ID and Stripe publishable key are required' }, { status: 400 });
    }

    // Use server-side Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured on the server. Please contact support.' }, { status: 500 });
    }

    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    
    try {
      // Test the keys by creating a test account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'US',
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
      });

      // Create account link
      const accountLink = await stripe.accountLinks.create({
        account: account.id,
        refresh_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/settings?stripe_connected=true`,
        type: 'account_onboarding',
      });

      return NextResponse.json({ url: accountLink.url });
    } catch (stripeError) {
      console.error('Stripe API error:', stripeError);
      return NextResponse.json({ error: 'Invalid Stripe keys. Please check your credentials.' }, { status: 400 });
    }
  } catch (error) {
    console.error('Stripe connect API error:', error);
    return NextResponse.json(
      { error: 'Failed to create Stripe Connect account' }, 
      { status: 500 }
    );
  }
} 