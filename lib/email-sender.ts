import { getGmailClient, getStoredRefreshToken } from './gmail'
import { supabaseAdmin } from './supabase'

export interface SendEmailParams {
  to: string
  name: string
  subject: string
  message: string
  emailType: 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST' | 'BULK' | 'CUSTOM'
  applicantId: string | null
}

function buildHtmlEmail(name: string, message: string, subject: string): string {
  const whatsappGroup = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'
  
  // Clean name: Never use "LinkedIn", "noreply", or empty
  const safeName = (!name || name.toLowerCase().includes('linkedin') || name.toLowerCase().includes('noreply') || name.includes('@'))
    ? 'Candidate'
    : name.trim()

  // Normalize literal \n or escaped \\n from DB
  let cleanMessage = message
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/{name}/g, safeName)

  // Remove raw WhatsApp URL from body text so it doesn't look messy alongside the official button
  cleanMessage = cleanMessage.replace(/https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/g, '').trim()

  // Convert double-newlines to clean paragraphs
  const paragraphs = cleanMessage
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => `<p style="margin:0 0 16px;color:#334155;font-size:15px;line-height:1.75;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background-color:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
  <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="background-color:#f1f5f9;padding:36px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" border="0" cellspacing="0" cellpadding="0" style="max-width:580px;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.06);border:1px solid #e2e8f0;">
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#4f46e5 0%,#7c3aed 100%);padding:36px 32px;text-align:center;">
              <div style="display:inline-block;width:46px;height:46px;line-height:46px;background:rgba(255,255,255,0.18);border-radius:12px;font-size:24px;margin-bottom:12px;text-align:center;">
                🚀
              </div>
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">MentorTechz</h1>
              <p style="margin:6px 0 0;color:rgba(255,255,255,0.9);font-size:13px;font-weight:500;letter-spacing:0.2px;">
                Software Development Internship Program 2025
              </p>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="padding:36px 32px 28px;background:#ffffff;">
              <div style="color:#334155;font-size:15px;line-height:1.75;">
                ${paragraphs}
              </div>

              <!-- Official WhatsApp Channel Card -->
              <div style="margin:28px 0 16px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:14px;padding:24px;text-align:center;">
                <div style="font-size:12px;font-weight:700;color:#15803d;letter-spacing:0.8px;text-transform:uppercase;margin-bottom:6px;">
                  Official Communication Channel
                </div>
                <div style="font-size:14px;color:#166534;margin-bottom:18px;line-height:1.5;">
                  Join our official WhatsApp group to receive onboarding instructions, meeting links, and project cohort announcements.
                </div>
                <a href="${whatsappGroup}"
                   target="_blank"
                   style="display:inline-block;background:#25D366;color:#ffffff;padding:13px 32px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px;letter-spacing:0.2px;box-shadow:0 4px 14px rgba(37,211,102,0.35);">
                  📱 Join WhatsApp Group
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8fafc;padding:24px 32px;border-top:1px solid #f1f5f9;text-align:center;">
              <p style="margin:0 0 6px;color:#64748b;font-size:13px;">
                Have questions? Reach us directly at <a href="mailto:softwarehousementor@gmail.com" style="color:#4f46e5;text-decoration:none;font-weight:600;">softwarehousementor@gmail.com</a>
              </p>
              <p style="margin:0;color:#94a3b8;font-size:11px;">
                © 2025 MentorTechz. All rights reserved. • This is an automated communication regarding your application.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

async function incrementEmailCount() {
  const { data } = await supabaseAdmin
    .from('settings')
    .select('value')
    .eq('key', 'emails_sent_today')
    .single()

  const current = parseInt(data?.value || '0', 10)
  await supabaseAdmin
    .from('settings')
    .update({ value: String(current + 1), updated_at: new Date().toISOString() })
    .eq('key', 'emails_sent_today')
}

export async function sendEmail({ to, name, subject, message, emailType, applicantId }: SendEmailParams) {
  const refreshToken = await getStoredRefreshToken()
  if (!refreshToken) throw new Error('Gmail not connected. Please authorize Gmail first.')

  const gmail = getGmailClient(refreshToken)
  const fromEmail = process.env.GMAIL_USER_EMAIL || 'softwarehousementor@gmail.com'

  const personalizedSubject = subject.replace(/{name}/g, name).replace(/{email}/g, to)
  const htmlBody = buildHtmlEmail(name, message, personalizedSubject)

  // Encode subject for MIME (handles em dash —, special chars, unicode)
  const encodedSubject = `=?UTF-8?B?${Buffer.from(personalizedSubject, 'utf8').toString('base64')}?=`
  // Encode display name in From/To headers
  const encodedName = name && !name.includes('@') 
    ? `=?UTF-8?B?${Buffer.from(name, 'utf8').toString('base64')}?=`
    : name

  const emailLines = [
    `From: =?UTF-8?B?${Buffer.from('MentorTechz', 'utf8').toString('base64')}?= <${fromEmail}>`,
    `To: ${encodedName} <${to}>`,
    `Subject: ${encodedSubject}`,
    `MIME-Version: 1.0`,
    `Content-Type: text/html; charset=utf-8`,
    ``,
    htmlBody,
  ]

  const raw = Buffer.from(emailLines.join('\r\n'))
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '')

  await gmail.users.messages.send({ userId: 'me', requestBody: { raw } })

  // Log to email_logs
  const personalizedMessage = message.replace(/{name}/g, name).replace(/{email}/g, to)
  await supabaseAdmin.from('email_logs').insert({
    applicant_id: applicantId,
    applicant_email: to,
    applicant_name: name,
    email_type: emailType,
    subject: personalizedSubject,
    message: personalizedMessage,
    sent_by: fromEmail,
  })

  // Update applicant status
  if (applicantId) {
    const now = new Date().toISOString()
    if (emailType === 'CONFIRMATION') {
      await supabaseAdmin
        .from('applicants')
        .update({ status: 'CONFIRMED', confirmation_sent_at: now, updated_at: now })
        .eq('id', applicantId)
    } else if (emailType === 'REJECTION') {
      await supabaseAdmin
        .from('applicants')
        .update({ status: 'REJECTED', rejection_sent_at: now, updated_at: now })
        .eq('id', applicantId)
    } else if (emailType === 'SHORTLIST') {
      await supabaseAdmin
        .from('applicants')
        .update({ status: 'SHORTLISTED', updated_at: now })
        .eq('id', applicantId)
    }
  }

  // Track daily email count
  await incrementEmailCount()

  return { success: true }
}

export async function getDailyEmailStats(): Promise<{ sent: number; limit: number }> {
  const todayStart = new Date()
  todayStart.setHours(0, 0, 0, 0)

  const [logsResult, limitResult] = await Promise.all([
    supabaseAdmin
      .from('email_logs')
      .select('*', { count: 'exact', head: true })
      .gte('sent_at', todayStart.toISOString()),
    supabaseAdmin
      .from('settings')
      .select('value')
      .eq('key', 'daily_email_limit')
      .maybeSingle(),
  ])

  const sent = logsResult.count || 0
  const limit = parseInt(limitResult.data?.value || '500', 10)
  return { sent, limit }
}
