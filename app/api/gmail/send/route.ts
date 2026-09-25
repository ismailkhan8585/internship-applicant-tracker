import { NextResponse } from 'next/server'
import { getAdminFromRequest } from '@/lib/auth'
import { sendEmail } from '@/lib/email-sender'
import { getDailyEmailStats } from '@/lib/email-sender'

export async function POST(request: Request) {
  const admin = await getAdminFromRequest(request)
  if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const body = await request.json()
    const { to, name, subject, message, emailType, applicantId } = body

    if (!to || !name || !subject || !message || !emailType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check daily limit
    const { sent, limit } = await getDailyEmailStats()
    if (sent >= limit) {
      return NextResponse.json(
        { error: `Daily email limit reached (${limit}/day). Resets at midnight.` },
        { status: 429 }
      )
    }

    await sendEmail({ to, name, subject, message, emailType, applicantId })
    return NextResponse.json({ success: true })
  } catch (err: any) {
    console.error('Send email error:', err)
    return NextResponse.json({ error: err.message || 'Failed to send email' }, { status: 500 })
  }
}
