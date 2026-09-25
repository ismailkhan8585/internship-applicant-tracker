'use client'

interface EmailPreviewProps {
  name: string
  email: string
  subject: string
  message: string
}

export default function EmailPreview({ name, email, subject, message }: EmailPreviewProps) {
  const whatsapp = process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'
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
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.08)',
      borderRadius: '16px',
      overflow: 'hidden',
      height: '100%',
    }}>
      {/* Preview header */}
      <div style={{
        padding: '16px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(239,68,68,0.6)',
        }} />
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(245,158,11,0.6)',
        }} />
        <div style={{
          width: '10px', height: '10px', borderRadius: '50%',
          background: 'rgba(34,197,94,0.6)',
        }} />
        <span style={{ fontSize: '12px', color: '#94a3b8', marginLeft: '8px', fontWeight: 600 }}>
          Live Email Preview
        </span>
      </div>

      {/* Email mock */}
      <div style={{ padding: '0', overflowY: 'auto', maxHeight: '600px' }}>
        {/* Email subject bar */}
        <div style={{
          padding: '12px 20px',
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
          <div style={{ fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>
            To: <strong style={{ color: '#cbd5e1' }}>{previewName}</strong> &lt;{previewEmail}&gt;
          </div>
          <div style={{ fontSize: '13px', fontWeight: 600, color: '#e2e8f0' }}>
            {subject || '(No subject)'}
          </div>
        </div>

        {/* Actual email HTML preview */}
        <div
          style={{
            background: '#ffffff',
            margin: '16px',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            border: '1px solid #e2e8f0',
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
