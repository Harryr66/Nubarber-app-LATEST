import { NextRequest, NextResponse } from 'next/server';
import { getGmbAuthUrl } from '@/lib/gmb';

export async function POST(request: NextRequest) {
  try {
    const { clientId, redirectUri } = await request.json();
    
    if (!clientId || !redirectUri) {
      return NextResponse.json({ error: 'Google client ID and redirect URI are required' }, { status: 400 });
    }

    // Use server-side Google configuration
    if (!process.env.GMB_CLIENT_SECRET) {
      return NextResponse.json({ error: 'Google My Business is not configured on the server. Please contact support.' }, { status: 500 });
    }

    // Create OAuth2 client with server-side secret
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      process.env.GMB_CLIENT_SECRET, // Use server-side secret
      redirectUri
    );

    const scopes = [
      'https://www.googleapis.com/auth/business.manage',
    ];

    try {
      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes,
      });

      return NextResponse.json({ url });
    } catch (authError) {
      console.error('Google OAuth error:', authError);
      return NextResponse.json({ error: 'Invalid Google API credentials. Please check your credentials.' }, { status: 400 });
    }
  } catch (error) {
    console.error('GMB connect API error:', error);
    return NextResponse.json(
      { error: 'Failed to get Google My Business auth URL' }, 
      { status: 500 }
    );
  }
} 