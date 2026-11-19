'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { Mail, Check, Star, X, FileText, StickyNote, LoaderCircle } from 'lucide-react'
import type { Applicant, EmailTemplate } from '@/lib/supabase'

interface QuickActionsProps {
  applicant: Applicant
  onStatusChange: (id: string, newStatus: string) => void
  onViewCV: (applicant: Applicant) => void
  onNotes: (applicant: Applicant) => void
}

export default function QuickActions({ applicant, onStatusChange, onViewCV, onNotes }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)

  const sendAndUpdate = async (emailType: 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST', newStatus: string) => {
    setLoading(emailType)
    try {
      const tplRes = await fetch('/api/templates')
      const tplData = await tplRes.json()
      const templates: EmailTemplate[] = tplData.templates || []
      const template = templates.find((t) => t.template_type === emailType && t.is_default)
        || templates.find((t) => t.template_type === emailType)

      if (!template) {
        toast.error('No email template found for this action')
        return
      }

      const res = await fetch('/api/gmail/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: applicant.email,
          name: applicant.name,
          subject: template.subject,
          message: template.message,
          emailType,
          applicantId: applicant.id,
        }),
      })

      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Failed to send email')
        return
      }

      onStatusChange(applicant.id, newStatus)
      toast.success(`Email sent to ${applicant.name}`)
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  const spinner = <LoaderCircle size={15} className="spin" />
  const busy = loading !== null

  return (
    <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
      <Link
        href={`/email?to=${encodeURIComponent(applicant.email)}&name=${encodeURIComponent(applicant.name)}&id=${applicant.id}`}
        title="Compose email"
        aria-label="Compose email"
        className="action-btn"
      >
        <Mail size={15} />
      </Link>

      {applicant.status !== 'CONFIRMED' && (
        <button
          title="Send confirmation email"
          aria-label="Send confirmation email"
          className="action-btn confirm"
          onClick={() => sendAndUpdate('CONFIRMATION', 'CONFIRMED')}
          disabled={busy}
        >
          {loading === 'CONFIRMATION' ? spinner : <Check size={15} strokeWidth={2.4} />}
        </button>
      )}

      {applicant.status !== 'SHORTLISTED' && (
        <button
          title="Send shortlist email"
          aria-label="Send shortlist email"
          className="action-btn shortlist"
          onClick={() => sendAndUpdate('SHORTLIST', 'SHORTLISTED')}
          disabled={busy}
        >
          {loading === 'SHORTLIST' ? spinner : <Star size={15} />}
        </button>
      )}

      {applicant.status !== 'REJECTED' && (
        <button
          title="Send rejection email"
          aria-label="Send rejection email"
          className="action-btn reject"
          onClick={() => sendAndUpdate('REJECTION', 'REJECTED')}
          disabled={busy}
        >
          {loading === 'REJECTION' ? spinner : <X size={15} strokeWidth={2.4} />}
        </button>
      )}

      <span style={{ width: 1, height: 18, background: 'var(--hairline-strong)', margin: '0 3px' }} />

      <button
        title={applicant.cv_filename ? 'View CV' : 'No CV attached'}
        aria-label="View CV"
        className="action-btn"
        onClick={() => onViewCV(applicant)}
        disabled={!applicant.cv_filename && !applicant.gmail_message_id}
        style={{ opacity: !applicant.cv_filename ? 0.4 : 1 }}
      >
        <FileText size={15} />
      </button>

      <button
        title="Notes"
        aria-label="Notes"
        className="action-btn"
        onClick={() => onNotes(applicant)}
        style={applicant.notes ? { color: 'var(--amber)' } : undefined}
      >
        <StickyNote size={15} />
      </button>
    </div>
  )
}
