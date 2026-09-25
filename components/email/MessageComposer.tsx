'use client'

interface MessageComposerProps {
  subject: string
  message: string
  onSubjectChange: (val: string) => void
  onMessageChange: (val: string) => void
}

export default function MessageComposer({ subject, message, onSubjectChange, onMessageChange }: MessageComposerProps) {
  const wordCount = message.trim() ? message.trim().split(/\s+/).length : 0
  const charCount = message.length

  return (
    <div>
      {/* Subject */}
      <div style={{ marginBottom: '16px' }}>
        <label style={{
          display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8',
          marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase',
        }}>
          Subject Line
        </label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Email subject..."
          className="input-field"
        />
      </div>

      {/* Message */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <label style={{
            fontSize: '12px', fontWeight: 700, color: '#94a3b8',
            letterSpacing: '0.08em', textTransform: 'uppercase',
          }}>
            Message Body
          </label>
          <span style={{ fontSize: '12px', color: '#475569' }}>
            {wordCount} words · {charCount} chars
          </span>
        </div>
        <textarea
          id="email-message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder="Write your message here...&#10;&#10;Use {name} to personalize with recipient's name&#10;Use {email} for their email address"
          className="input-field"
          style={{ minHeight: '220px', lineHeight: '1.7', fontFamily: 'Inter, monospace' }}
        />
        <div style={{
          display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap', alignItems: 'center'
        }}>
          <button
            type="button"
            onClick={() => {
              const waLink = 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'
              onMessageChange(message ? `${message}\n\n${waLink}` : waLink)
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '4px 10px',
              background: 'rgba(37,211,102,0.15)',
              border: '1px solid rgba(37,211,102,0.35)',
              borderRadius: '6px',
              fontSize: '11px',
              color: '#4ade80',
              fontWeight: 600,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
            title="Click to append WhatsApp group link to message"
          >
            ➕ Insert WhatsApp Group Link
          </button>
          <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            background: 'rgba(102,126,234,0.15)',
            border: '1px solid rgba(102,126,234,0.2)',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#a78bfa',
            fontWeight: 600,
          }}>
            💡 Use {'{name}'} for personalization
          </span>
          <span style={{
            display: 'inline-block',
            padding: '3px 8px',
            background: 'rgba(34,197,94,0.1)',
            border: '1px solid rgba(34,197,94,0.2)',
            borderRadius: '6px',
            fontSize: '11px',
            color: '#86efac',
            fontWeight: 600,
          }}>
            📱 WhatsApp button included in email template
          </span>
        </div>
      </div>
    </div>
  )
}
