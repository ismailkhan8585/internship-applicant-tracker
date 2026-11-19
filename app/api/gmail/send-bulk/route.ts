import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { sendEmail, getDailyEmailStats } from '@/lib/email-sender'
import { supabaseAdmin } from '@/lib/supabase'

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { status, subject, message, emailType } = body

    if (!subject || !message || !emailType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fetch applicants with specified status (or all)
    let query = supabaseAdmin.from('applicants').select('id, name, email, status, confirmation_sent_at')
    if (status && status !== 'ALL') {
      query = query.eq('status', status)
    }

    // Safety: If sending confirmation emails, NEVER re-send to someone who already received one
    if (emailType === 'CONFIRMATION') {
      query = query.is('confirmation_sent_at', null)
    }

    query = query.limit(500)

    const { data: applicants, error } = await query

    if (error) throw new Error(error.message)
    if (!applicants || applicants.length === 0) {
      return NextResponse.json({ sent: 0, skipped: 0, failed: 0, total: 0 })
    }

    let sent = 0
    let skipped = 0
    let failed = 0
    const total = applicants.length

    for (const applicant of applicants) {
      // Check daily limit before each email
      const { sent: sentToday, limit } = await getDailyEmailStats()
      if (sentToday >= limit) {
        skipped += total - sent - failed
        break
      }

      try {
        await sendEmail({
          to: applicant.email,
          name: applicant.name,
          subject,
          message,
          emailType,
          applicantId: applicant.id,
        })
        sent++
      } catch (caught) {
        const err = caught as { message?: string; status?: number; code?: number }
        console.error(`Failed to send to ${applicant.email}:`, err?.message || err)
        const errMsg = err?.message || ''

        // If Google rate limit / temporary block triggered, STOP immediately
        if (
          errMsg.includes('User-rate limit') ||
          errMsg.includes('rate limit') ||
          errMsg.includes('quotaExceeded') ||
          err?.status === 429 ||
          err?.code === 429
        ) {
          failed++
          skipped += total - sent - failed
          return NextResponse.json({
            sent,
            skipped,
            failed,
            total,
            rateLimited: true,
            retryAfter: 'Google temporary rate limit hit. Please wait 15-20 minutes before resuming.',
          })
        }

        // For other individual errors (e.g. invalid recipient address), log and continue
        failed++
      }

      // 2.5 seconds delay between emails to respect Google's burst sending limit
      await sleep(2500)
    }

    return NextResponse.json({ sent, skipped, failed, total })
  } catch (err) {
    console.error('Bulk send error:', err)
    return NextResponse.json({ error: (err instanceof Error && err.message) || 'Bulk send failed' }, { status: 500 })
  }
}
