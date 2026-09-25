import { NextResponse } from 'next/server'
import { getOAuth2Client } from '@/lib/gmail'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const error = searchParams.get('error')

  if (error) {
    return NextResponse.redirect(
      new URL(`/dashboard?gmail_error=${encodeURIComponent(error)}`, request.url)
    )
  }

  if (!code) {
    return NextResponse.redirect(new URL('/dashboard?gmail_error=no_code', request.url))
  }

  try {
    const oauth2Client = getOAuth2Client()
    const { tokens } = await oauth2Client.getToken(code)

    if (!tokens.refresh_token) {
      return NextResponse.redirect(
        new URL('/dashboard?gmail_error=no_refresh_token', request.url)
      )
    }

    // Save refresh token to settings table and memory
    await supabaseAdmin
      .from('settings')
      .upsert({ key: 'gmail_refresh_token', value: tokens.refresh_token, updated_at: new Date().toISOString() })

    process.env.GMAIL_REFRESH_TOKEN = tokens.refresh_token
    
    return NextResponse.redirect(new URL('/dashboard?gmail_connected=true', request.url))
  } catch (err) {
    console.error('Gmail OAuth callback error:', err)
    return NextResponse.redirect(
      new URL('/dashboard?gmail_error=exchange_failed', request.url)
    )
  }
}
