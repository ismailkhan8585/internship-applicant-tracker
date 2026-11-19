'use client'

interface EmailPreviewProps {
  name: string
  email: string
  subject: string
  message: string
}

export default function EmailPreview({ name, email, subject, message }: EmailPreviewProps) {
  const previewName = (!name || name.toLowerCase().includes('linkedin') || name.toLowerCase().includes('noreply'))
    ? 'Muhammad Ali'
    : name
  const previewEmail = email || 'applicant@example.com'

  let cleanMsg = message
    .replace(/\\n/g, '\n')
    .replace(/\r\n/g, '\n')
    .replace(/{name}/g, previewName)
    .replace(/{email}/g, previewEmail)
    .replace(/https:\/\/chat\.whatsapp\.com\/[a-zA-Z0-9_-]+/g, '')
    .trim()

  const paragraphs = cleanMsg
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="surface" style={{ overflow: 'hidden', borderRadius: 22 }}>
      {/* Window chrome */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--hairline)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        background: 'rgba(255,255,255,0.015)',
      }}>
        {['#ff6b7a', '#f5b84b', '#3ddc97'].map((c) => (
          <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.75 }} />
        ))}
        <span style={{ marginLeft: 10, display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-2)', fontWeight: 600 }}>
          <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          Live preview
        </span>
      </div>

      <div style={{ overflowY: 'auto', maxHeight: 'calc(100vh - 220px)', minHeight: 420 }}>
        {/* Envelope */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--hairline)', display: 'grid', gap: 6 }}>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            <span style={{ display: 'inline-block', width: 52 }}>To</span>
            <strong style={{ color: 'var(--text)', fontWeight: 600 }}>{previewName}</strong>{' '}
            <span>&lt;{previewEmail}&gt;</span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-3)' }}>
            <span style={{ display: 'inline-block', width: 52 }}>Subject</span>
            <strong style={{ color: subject ? 'var(--text)' : 'var(--text-4)', fontWeight: 600, fontSize: 13.5 }}>
              {subject || 'No subject yet'}
            </strong>
          </div>
        </div>

        {/* Actual email HTML preview */}
        <div
          style={{
            background: '#ffffff',
            margin: '18px',
            borderRadius: '14px',
            overflow: 'hidden',
            boxShadow: '0 24px 60px -20px rgba(0,0,0,0.7)',
          }}
        >
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            padding: '28px 24px',
            textAlign: 'center',
          }}>
            <div style={{
              display: 'inline-block',
              width: '42px',
              height: '42px',
              lineHeight: '42px',
              background: 'rgba(255,255,255,0.18)',
              borderRadius: '10px',
              fontSize: '22px',
              marginBottom: '10px',
            }}>🚀</div>
            <h1 style={{ margin: 0, color: '#ffffff', fontSize: '22px', fontWeight: 800 }}>MentorTechz</h1>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.9)', fontSize: '12px', fontWeight: 500 }}>
              Software Development Internship Program 2025
            </p>
          </div>

          {/* Body */}
          <div style={{ padding: '28px 24px', background: '#ffffff' }}>
            {paragraphs.length > 0 ? (
              paragraphs.map((p, idx) => (
                <p
                  key={idx}
                  style={{ color: '#334155', fontSize: '14px', lineHeight: '1.75', margin: '0 0 14px' }}
                  dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br />') }}
                />
              ))
            ) : (
              <div style={{ color: '#94a3b8', fontSize: '14px', fontStyle: 'italic' }}>
                Your message will appear here...
              </div>
            )}

            {/* Official WhatsApp Card */}
            <div style={{
              margin: '22px 0 10px',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              borderRadius: '12px',
              padding: '20px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#15803d', letterSpacing: '0.8px', textTransform: 'uppercase', marginBottom: '4px' }}>
                Official Communication Channel
              </div>
              <div style={{ fontSize: '13px', color: '#166534', marginBottom: '14px', lineHeight: '1.4' }}>
                Join our official WhatsApp group to receive onboarding instructions and cohort announcements.
              </div>
              <span style={{
                display: 'inline-block',
                background: '#25D366',
                color: '#ffffff',
                padding: '11px 28px',
                borderRadius: '50px',
                fontSize: '13px',
                fontWeight: 700,
                boxShadow: '0 4px 12px rgba(37,211,102,0.3)',
              }}>
                📱 Join WhatsApp Group
              </span>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            background: '#f8fafc',
            padding: '18px 24px',
            borderTop: '1px solid #f1f5f9',
            textAlign: 'center',
          }}>
            <p style={{ margin: 0, color: '#64748b', fontSize: '12px' }}>
              Have questions? Reach us at <strong style={{ color: '#4f46e5' }}>softwarehousementor@gmail.com</strong>
            </p>
            <p style={{ margin: '4px 0 0', color: '#94a3b8', fontSize: '11px' }}>
              © 2025 MentorTechz. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
