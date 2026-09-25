import { google } from 'googleapis'
import { supabaseAdmin } from './supabase'

export function getGmailClient(refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
  oauth2Client.setCredentials({ refresh_token: refreshToken })
  return google.gmail({ version: 'v1', auth: oauth2Client })
}

export function getOAuth2Client() {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  )
}

export async function getStoredRefreshToken(): Promise<string | null> {
  try {
    const { data } = await supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'gmail_refresh_token')
      .maybeSingle()
    if (data?.value) {
      return data.value
    }
  } catch (err) {
    console.error('Failed to get token from settings:', err)
  }
  return process.env.GMAIL_REFRESH_TOKEN || null
}

export function getAuthUrl() {
  const oauth2Client = getOAuth2Client()
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.send',
    ],
  })
}
