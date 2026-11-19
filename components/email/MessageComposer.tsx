'use client'

import { Link as LinkIcon, Lightbulb, MessageCircle } from 'lucide-react'

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
      <div style={{ marginBottom: 16 }}>
        <label htmlFor="email-subject" className="field-label">Subject line</label>
        <input
          id="email-subject"
          type="text"
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="e.g. Welcome to the MentorTechz Internship"
          className="input-field"
        />
      </div>

      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <label htmlFor="email-message" className="field-label" style={{ margin: 0 }}>Message</label>
          <span className="tabular" style={{ fontSize: 12, color: 'var(--text-3)' }}>
            {wordCount} words · {charCount} chars
          </span>
        </div>
        <textarea
          id="email-message"
          value={message}
          onChange={(e) => onMessageChange(e.target.value)}
          placeholder={'Dear {name},\n\nWrite your message here…'}
          className="input-field"
          style={{ minHeight: 240 }}
        />

        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <button
            type="button"
            onClick={() => {
              const waLink = 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'
              onMessageChange(message ? `${message}\n\n${waLink}` : waLink)
            }}
            className="btn btn-sm btn-tint tint-wa"
            title="Append the WhatsApp group link to the message"
          >
            <LinkIcon size={13} /> Insert WhatsApp link
          </button>
          <span className="chip">
            <Lightbulb size={13} style={{ color: 'var(--amber)' }} />
            <span className="kbd">{'{name}'}</span> personalises each email
          </span>
          <span className="chip">
            <MessageCircle size={13} style={{ color: 'var(--wa)' }} />
            WhatsApp button auto-included
          </span>
        </div>
      </div>
    </div>
  )
}
