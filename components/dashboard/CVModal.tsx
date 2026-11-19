'use client'

import { X, Mail, Calendar, Paperclip, ExternalLink, FileText, Inbox } from 'lucide-react'
import type { Applicant } from '@/lib/supabase'
import { Avatar } from './ApplicantTable'
import StatusBadge from './StatusBadge'

interface CVModalProps {
  applicant: Applicant | null
  onClose: () => void
}

export default function CVModal({ applicant, onClose }: CVModalProps) {
  if (!applicant) return null

  const applied = new Date(applicant.date_applied).toLocaleDateString('en-PK', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '520px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <span className="eyebrow"><FileText size={13} /> Applicant profile</span>
          <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={18} /></button>
        </div>

        {/* Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <Avatar name={applicant.name} seed={applicant.email} size={60} />
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 21, fontWeight: 700, letterSpacing: '-0.025em', color: 'var(--text)' }}>
              {applicant.name}
            </div>
            <div style={{ marginTop: 8 }}><StatusBadge status={applicant.status} /></div>
          </div>
        </div>

        <div style={{
          display: 'grid', gap: 1, borderRadius: 14, overflow: 'hidden',
          border: '1px solid var(--hairline)', background: 'var(--hairline)', marginBottom: 20,
        }}>
          {[
            { icon: Mail, label: 'Email', value: applicant.email },
            { icon: Calendar, label: 'Applied', value: applied },
            ...(applicant.subject ? [{ icon: Inbox, label: 'Subject', value: applicant.subject }] : []),
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--bg-modal)' }}>
              <Icon size={15} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: 'var(--text-3)', width: 62, flexShrink: 0 }}>{label}</span>
              <span style={{ fontSize: 13.5, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{value}</span>
            </div>
          ))}
        </div>

        {applicant.cv_filename ? (
          <>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: 16, borderRadius: 16, marginBottom: 14,
              background: 'linear-gradient(135deg, rgba(139,123,255,0.1), rgba(208,140,255,0.04))',
              border: '1px solid var(--accent-line)',
            }}>
              <span className="icon-tile" style={{ width: 44, height: 44, background: 'rgba(139,123,255,0.16)', color: 'var(--accent)' }}>
                <Paperclip size={20} />
              </span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 650, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {applicant.cv_filename}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 2 }}>Stored as a Gmail attachment</div>
              </div>
            </div>

            <a
              href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(applicant.email)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary btn-lg btn-block"
            >
              Open CV in Gmail <ExternalLink size={16} />
            </a>
          </>
        ) : (
          <div style={{
            padding: 22, textAlign: 'center', borderRadius: 16,
            background: 'rgba(255,107,122,0.06)', border: '1px dashed rgba(255,107,122,0.3)',
          }}>
            <p style={{ margin: 0, fontSize: 14, color: 'var(--red)', fontWeight: 650 }}>No CV attached</p>
            <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-3)' }}>
              This applicant didn&apos;t include a CV in their email.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
