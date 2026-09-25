'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import type { Applicant } from '@/lib/supabase'

interface CVModalProps {
  applicant: Applicant | null
  onClose: () => void
}

export default function CVModal({ applicant, onClose }: CVModalProps) {
  const [loading, setLoading] = useState(false)

  if (!applicant) return null

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-content"
        style={{ maxWidth: '520px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
            📄 CV Details
          </h3>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '6px 12px',
              fontFamily: 'Inter, sans-serif', fontSize: '13px', fontWeight: 600,
            }}
          >
            ✕ Close
          </button>
        </div>

        {/* Applicant info */}
        <div style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '12px',
          padding: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '16px', fontWeight: 700, color: '#e2e8f0', marginBottom: '4px' }}>
            {applicant.name}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8', marginBottom: '4px' }}>
            📧 {applicant.email}
          </div>
          <div style={{ fontSize: '13px', color: '#94a3b8' }}>
            📅 Applied: {new Date(applicant.date_applied).toLocaleDateString('en-PK', {
              day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
            })}
          </div>
        </div>

        {applicant.cv_filename ? (
          <div>
            <div style={{
              background: 'rgba(102,126,234,0.08)',
              border: '1px solid rgba(102,126,234,0.2)',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
              marginBottom: '16px',
            }}>
              <div style={{ fontSize: '40px', marginBottom: '12px' }}>📎</div>
              <div style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>
                {applicant.cv_filename}
              </div>
              <div style={{ fontSize: '12px', color: '#64748b' }}>PDF Attachment</div>
            </div>

            <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '0 0 16px' }}>
              CV attachments are stored in Gmail. To view the CV, open Gmail directly and find the email from {applicant.email}.
            </p>

            <a
              href={`https://mail.google.com/mail/u/0/#search/${encodeURIComponent(applicant.email)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{
                display: 'block',
                textAlign: 'center',
                textDecoration: 'none',
                padding: '12px',
                borderRadius: '10px',
              }}
            >
              📬 Open in Gmail
            </a>
          </div>
        ) : (
          <div style={{
            background: 'rgba(239,68,68,0.08)',
            border: '1px solid rgba(239,68,68,0.2)',
            borderRadius: '12px',
            padding: '24px',
            textAlign: 'center',
          }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📭</div>
            <p style={{ margin: 0, fontSize: '14px', color: '#fca5a5', fontWeight: 600 }}>
              No CV attachment found
            </p>
            <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
              This applicant did not attach a CV to their email.
            </p>
          </div>
        )}

        {applicant.subject && (
          <div style={{
            marginTop: '16px',
            padding: '12px 16px',
            background: 'rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: '10px',
          }}>
            <span style={{ fontSize: '12px', color: '#64748b', fontWeight: 600 }}>EMAIL SUBJECT</span>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#94a3b8' }}>{applicant.subject}</p>
          </div>
        )}
      </div>
    </div>
  )
}
