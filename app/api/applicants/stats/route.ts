import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [
    totalResult,
    pendingResult,
    confirmedResult,
    shortlistedResult,
    rejectedResult,
    emailLogsResult,
    settingsResult,
  ] = await Promise.all([
    supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }),
    supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }).eq('status', 'PENDING'),
    supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }).eq('status', 'CONFIRMED'),
    supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }).eq('status', 'SHORTLISTED'),
    supabaseAdmin.from('applicants').select('*', { count: 'exact', head: true }).eq('status', 'REJECTED'),
    supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', todayStart.toISOString()),
    supabaseAdmin
      .from('settings')
      .select('key, value')
      .in('key', ['daily_email_limit', 'last_gmail_sync']),
  ])

  const settings = settingsResult.data || []
  const emailsSentToday = emailLogsResult.count || 0

  const stats = {
    total: totalResult.count || 0,
    pending: pendingResult.count || 0,
    confirmed: confirmedResult.count || 0,
    shortlisted: shortlistedResult.count || 0,
    rejected: rejectedResult.count || 0,
    emailsSentToday,
    dailyLimit: parseInt(settings.find((s) => s.key === 'daily_email_limit')?.value || '500', 10),
    lastGmailSync: settings.find((s) => s.key === 'last_gmail_sync')?.value || null,
  }

  return NextResponse.json(stats)
}
