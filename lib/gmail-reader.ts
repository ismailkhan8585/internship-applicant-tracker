import { getGmailClient, getStoredRefreshToken } from './gmail'
import { supabaseAdmin } from './supabase'

interface ParsedApplicant {
  name: string
  email: string
  subject: string | null
  gmail_message_id: string
  date_applied: string
  cv_filename: string | null
  status: 'PENDING'
  internship_post: string
}

function formatTitleCase(str: string): string {
  return str
    .toLowerCase()
    .split(/\s+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function parseFromHeader(from: string): { name: string; email: string } {
  let name = ''
  let email = ''

  const angleMatch = from.match(/^(.+?)\s*<(.+?)>/)
  if (angleMatch) {
    name = angleMatch[1].trim().replace(/^["']|["']$/g, '')
    email = angleMatch[2].trim().toLowerCase().replace(/[<>]/g, '')
  } else {
    email = from.trim().toLowerCase().replace(/[<>]/g, '')
    name = email.split('@')[0].replace(/[._-]/g, ' ')
  }

  name = name.replace(/\bvia\s+LinkedIn\b/gi, '').trim()

  if (name && !name.includes('@')) {
    name = formatTitleCase(name)
  }

  if (
    !name ||
    name.toLowerCase().includes('linkedin') ||
    name.toLowerCase().includes('noreply') ||
    name.toLowerCase().includes('support') ||
    name.toLowerCase().includes('notifications')
  ) {
    name = 'Applicant'
  }

  return { name, email }
}

function extractCandidateFromMessage(
  headers: { name?: string | null; value?: string | null }[],
  bodyText: string,
  snippet: string
): { name: string; email: string; role?: string } {
  const fromHeader = headers.find((h) => h.name?.toLowerCase() === 'from')?.value || ''
  const replyToHeader = headers.find((h) => h.name?.toLowerCase() === 'reply-to')?.value || ''
  const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || ''
  const adminEmail = (process.env.GMAIL_USER_EMAIL || 'softwarehousementor@gmail.com').toLowerCase()

  // Detect website application notifications (sent to admin from website or me)
  const isWebsiteForm =
    fromHeader.toLowerCase().includes(adminEmail) ||
    subject.toLowerCase().includes('job application') ||
    subject.toLowerCase().includes('internship application') ||
    subject.toLowerCase().includes('contact form')

  // Extract role if in subject (e.g. "New Job Application — Frontend Developer Intern")
  let role = 'Software Development Internship'
  const roleMatch = subject.match(/(?:Job Application|Internship Application|Application)\s*[-—–:]\s*([^\n\r]+)/i)
  if (roleMatch && roleMatch[1].trim()) {
    const rawRole = roleMatch[1].trim()
    if (!rawRole.toLowerCase().includes('mentortech')) {
      role = rawRole
    }
  }

  // 1. If Reply-To has candidate email
  if (isWebsiteForm && replyToHeader && !replyToHeader.toLowerCase().includes(adminEmail)) {
    const candidate = parseFromHeader(replyToHeader)
    if (candidate.email && candidate.email !== adminEmail) {
      return { ...candidate, role }
    }
  }

  // 2. If website notification without Reply-To, extract from body text or snippet
  if (isWebsiteForm) {
    const combined = `${bodyText} ${snippet}`
    
    // Extract candidate email
    const allEmails = [...combined.matchAll(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi)].map(
      (m) => m[0].toLowerCase()
    )
    const candidateEmail = allEmails.find(
      (e) =>
        e !== adminEmail &&
        !e.includes('google.com') &&
        !e.includes('googlemailer.com') &&
        !e.includes('linkedin.com') &&
        !e.includes('wordpress') &&
        !e.includes('noreply')
    )

    // Extract candidate name
    let name = ''
    const nameMatch = combined.match(
      /(?:Candidate Information\s*)?(?:Name|Full Name|Applicant Name)\s*[:=-]?\s*([a-zA-Z\s'.]+?)(?=\s*(?:Email|Phone|Mobile|Contact|Role|Position|Address|Subject|Message|CV|Resume|\n|\r|<|,|$))/i
    )
    if (nameMatch && nameMatch[1].trim()) {
      name = formatTitleCase(nameMatch[1].trim())
    }

    if (candidateEmail) {
      if (!name || name.length < 2) {
        name = formatTitleCase(candidateEmail.split('@')[0].replace(/[._-]/g, ' '))
      }
      return { name, email: candidateEmail, role }
    }
  }

  // 3. Standard direct email from applicant
  const candidate = parseFromHeader(fromHeader)
  return { ...candidate, role }
}

export async function syncGmailInbox(): Promise<{
  synced: number
  total: number
  error?: string
  remaining?: number
}> {
  const refreshToken = await getStoredRefreshToken()

  if (!refreshToken) {
    return {
      synced: 0,
      total: 0,
      error: 'Gmail is not connected or token expired! Please click the 📧 Gmail button in the top navigation bar to reconnect your Google account.',
    }
  }

  const gmail = getGmailClient(refreshToken)

  // 1. Fetch already imported message IDs and emails
  const { data: existingApplicants } = await supabaseAdmin
    .from('applicants')
    .select('gmail_message_id, email')
  const existingMsgIds = new Set(
    (existingApplicants || []).map((a) => a.gmail_message_id).filter(Boolean)
  )
  const existingEmails = new Set(
    (existingApplicants || []).map((a) => a.email.toLowerCase()).filter(Boolean)
  )

  // 2. Fetch messages: include direct applicant emails AND website job application notifications from Inbox
  const q = 'in:inbox -from:google.com -from:googlemailer.com (-from:me OR subject:"Application" OR subject:"Intern" OR subject:"Contact Form" OR subject:"Resume" OR subject:"CV")'
  let allMessageRefs: { id?: string | null }[] = []
  let pageToken: string | undefined = undefined

  try {
    do {
      const listResponse: any = await gmail.users.messages.list({
        userId: 'me',
        q,
        maxResults: 500,
        pageToken,
      })

      const pageMessages = listResponse.data.messages || []
      allMessageRefs = allMessageRefs.concat(pageMessages)
      pageToken = listResponse.data.nextPageToken
    } while (pageToken && allMessageRefs.length < 5000)
  } catch (err: any) {
    console.error('Gmail API list error:', err)
    if (err?.message?.includes('invalid_grant') || err?.code === 400) {
      return {
        synced: 0,
        total: 0,
        error: 'Your Gmail connection expired (Google 7-day limit in testing). Please click the 📧 Gmail button in the top navbar to reconnect with 1 click!',
      }
    }
    return { synced: 0, total: 0, error: err?.message || 'Failed to fetch messages from Gmail' }
  }

  // Filter down to only messages we haven't imported yet
  const unimportedMessages = allMessageRefs.filter((m) => m.id && !existingMsgIds.has(m.id))

  if (unimportedMessages.length === 0) {
    const { count } = await supabaseAdmin
      .from('applicants')
      .select('*', { count: 'exact', head: true })
    return { synced: 0, total: count || 0, remaining: 0 }
  }

  // Process up to 250 per sync click
  const BATCH_LIMIT = 250
  const targetBatch = unimportedMessages.slice(0, BATCH_LIMIT)
  const remainingAfterBatch = unimportedMessages.length - targetBatch.length

  const CHUNK_SIZE = 20
  const newApplicants: ParsedApplicant[] = []

  for (let i = 0; i < targetBatch.length; i += CHUNK_SIZE) {
    const chunk = targetBatch.slice(i, i + CHUNK_SIZE)

    await Promise.all(
      chunk.map(async (msg) => {
        try {
          const fullMsg = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          })

          const headers = fullMsg.data.payload?.headers || []
          const subject = headers.find((h) => h.name?.toLowerCase() === 'subject')?.value || null
          const dateHeader = headers.find((h) => h.name?.toLowerCase() === 'date')?.value || ''
          const snippet = fullMsg.data.snippet || ''

          // Extract body text if present
          let bodyText = ''
          function extractText(parts: any[]) {
            for (const p of parts) {
              if (p.mimeType === 'text/plain' && p.body?.data) {
                bodyText += Buffer.from(p.body.data, 'base64').toString('utf8')
              }
              if (p.parts) extractText(p.parts)
            }
          }
          if (fullMsg.data.payload?.parts) {
            extractText(fullMsg.data.payload.parts)
          } else if (fullMsg.data.payload?.body?.data) {
            bodyText = Buffer.from(fullMsg.data.payload.body.data, 'base64').toString('utf8')
          }

          const { name, email, role } = extractCandidateFromMessage(headers, bodyText, snippet)

          // Filter out invalid, marketing, sales, and automated spam domains
          const lowerEmail = email.toLowerCase()
          if (
            !lowerEmail ||
            lowerEmail === (process.env.GMAIL_USER_EMAIL || '').toLowerCase() ||
            lowerEmail.includes('google.com') ||
            lowerEmail.includes('googlemailer.com') ||
            lowerEmail.includes('linkedin.com') ||
            lowerEmail.includes('neon.tech') ||
            lowerEmail.includes('temu.com') ||
            lowerEmail.includes('hostinger.com') ||
            lowerEmail.includes('websitelaunches.com') ||
            lowerEmail.includes('snapchat.com') ||
            lowerEmail.includes('micro1.ai') ||
            lowerEmail.includes('grok.com') ||
            lowerEmail.includes('render.com') ||
            lowerEmail.includes('canva.com') ||
            lowerEmail.includes('medium.com') ||
            lowerEmail.includes('reddit.com') ||
            lowerEmail.includes('quora.com') ||
            lowerEmail.includes('github.com') ||
            lowerEmail.includes('vercel.com') ||
            lowerEmail.includes('supabase.com') ||
            lowerEmail.includes('pinterest.com') ||
            lowerEmail.includes('tiktok.com') ||
            lowerEmail.includes('instagram.com') ||
            lowerEmail.includes('facebookmail.com') ||
            lowerEmail.includes('twitter.com') ||
            lowerEmail.includes('noreply') ||
            lowerEmail.includes('no-reply') ||
            lowerEmail.includes('donotreply') ||
            lowerEmail.includes('mailer-daemon') ||
            existingEmails.has(lowerEmail)
          ) {
            return
          }

          // Find attachment (CV)
          const parts = fullMsg.data.payload?.parts || []
          let cvFilename: string | null = null

          function findAttachment(partsList: any[]): void {
            for (const part of partsList) {
              if (
                part.filename &&
                (part.mimeType === 'application/pdf' ||
                  part.mimeType === 'application/msword' ||
                  part.mimeType ===
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                  part.filename.toLowerCase().endsWith('.pdf') ||
                  part.filename.toLowerCase().endsWith('.doc') ||
                  part.filename.toLowerCase().endsWith('.docx') ||
                  part.filename.toLowerCase().includes('cv') ||
                  part.filename.toLowerCase().includes('resume'))
              ) {
                cvFilename = part.filename
                return
              }
              if (part.parts) findAttachment(part.parts)
            }
          }
          findAttachment(parts)

          existingEmails.add(lowerEmail)
          newApplicants.push({
            name,
            email: lowerEmail,
            subject,
            gmail_message_id: msg.id!,
            date_applied: new Date(dateHeader || Date.now()).toISOString(),
            cv_filename: cvFilename,
            status: 'PENDING',
            internship_post: role || 'Software Development Internship',
          })
        } catch {
          // skip individual message parse error
        }
      })
    )
  }

  if (newApplicants.length > 0) {
    const { error } = await supabaseAdmin.from('applicants').upsert(newApplicants, {
      onConflict: 'email',
      ignoreDuplicates: true,
    })

    if (error) {
      console.error('Supabase upsert error:', error)
      throw new Error(error.message)
    }
  }

  // Save last sync time in settings
  await supabaseAdmin
    .from('settings')
    .upsert({ key: 'last_gmail_sync', value: new Date().toISOString(), updated_at: new Date().toISOString() })

  // Get total count
  const { count } = await supabaseAdmin
    .from('applicants')
    .select('*', { count: 'exact', head: true })

  return { synced: newApplicants.length, total: count || 0, remaining: remainingAfterBatch }
}
