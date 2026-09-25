'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
import type { Applicant } from '@/lib/supabase'

interface QuickActionsProps {
  applicant: Applicant
  onStatusChange: (id: string, newStatus: string) => void
  onViewCV: (applicant: Applicant) => void
  onNotes: (applicant: Applicant) => void
}

export default function QuickActions({ applicant, onStatusChange, onViewCV, onNotes }: QuickActionsProps) {
  const [loading, setLoading] = useState<string | null>(null)
  const router = useRouter()

  const sendAndUpdate = async (emailType: 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST', newStatus: string) => {
    setLoading(emailType)
    try {
      // Get default template for this type
      const tplRes = await fetch('/api/templates')
      const tplData = await tplRes.json()
      const templates = tplData.templates || []
      const template = templates.find((t: any) => t.template_type === emailType && t.is_default)
        || templates.find((t: any) => t.template_type === emailType)

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
      toast.success(`✅ Email sent to ${applicant.name}`)
    } catch {
      toast.error('Network error')
    } finally {
      setLoading(null)
    }
  }

  const isLoading = (type: string) => loading === type

  return (
    <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flexWrap: 'wrap' }}>
      {/* Send Email */}
      <a
        href={`/email?to=${encodeURIComponent(applicant.email)}&name=${encodeURIComponent(applicant.name)}&id=${applicant.id}`}
        title="Send Email"
        className="action-btn"
      >
        ✉️
      </a>

      {/* Confirm (only if pending/rejected) */}
      {applicant.status !== 'CONFIRMED' && (
        <button
          title="Send Confirmation Email"
          className="action-btn confirm"
          onClick={() => sendAndUpdate('CONFIRMATION', 'CONFIRMED')}
          disabled={isLoading('CONFIRMATION')}
        >
          {isLoading('CONFIRMATION') ? '⏳' : '✓'}
        </button>
      )}

      {/* Shortlist */}
      {applicant.status !== 'SHORTLISTED' && (
        <button
          title="Send Shortlist Email"
          className="action-btn"
          onClick={() => sendAndUpdate('SHORTLIST', 'SHORTLISTED')}
          disabled={isLoading('SHORTLIST')}
          style={{ color: '#93c5fd' }}
        >
          {isLoading('SHORTLIST') ? '⏳' : '⭐'}
        </button>
      )}

      {/* Reject (only if not already rejected) */}
      {applicant.status !== 'REJECTED' && (
        <button
          title="Send Rejection Email"
          className="action-btn reject"
          onClick={() => sendAndUpdate('REJECTION', 'REJECTED')}
          disabled={isLoading('REJECTION')}
        >
          {isLoading('REJECTION') ? '⏳' : '✗'}
        </button>
      )}

      {/* View CV */}
      <button
        title="View CV"
        className="action-btn"
        onClick={() => onViewCV(applicant)}
        disabled={!applicant.cv_filename && !applicant.gmail_message_id}
        style={{ opacity: !applicant.cv_filename ? 0.4 : 1 }}
      >
        📄
      </button>

      {/* Notes */}
      <button
        title="Add Notes"
        className="action-btn"
        onClick={() => onNotes(applicant)}
      >
        📝
      </button>
    </div>
  )
}
