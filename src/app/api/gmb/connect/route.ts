import { NextRequest, NextResponse } from 'next/server';
import { getGmbAuthUrl } from '@/lib/gmb';

export async function POST(request: NextRequest) {
  try {
    const { clientId, clientSecret, redirectUri } = await request.json();
    
    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json({ error: 'Google API credentials are required' }, { status: 400 });
    }

    // Create OAuth2 client with user's credentials
    const { google } = await import('googleapis');
    const oauth2Client = new google.auth.OAuth2(
      clientId,
      clientSecret,
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