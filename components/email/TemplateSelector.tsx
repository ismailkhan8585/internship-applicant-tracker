'use client'

interface Template {
  id: string
  name: string
  subject: string
  message: string
  template_type: string
}

interface TemplateSelectorProps {
  templates: Template[]
  onLoad: (template: Template) => void
}

export default function TemplateSelector({ templates, onLoad }: TemplateSelectorProps) {
  if (templates.length === 0) return null

  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Load Template
      </label>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        {templates.map((t) => {
          const typeColors: Record<string, string> = {
            CONFIRMATION: '#22c55e',
            SHORTLIST: '#3b82f6',
            REJECTION: '#ef4444',
            CUSTOM: '#667eea',
          }
          const color = typeColors[t.template_type] || '#667eea'

          return (
            <button
              key={t.id}
              id={`template-${t.id}`}
              onClick={() => onLoad(t)}
              style={{
                padding: '7px 14px',
                background: `${color}18`,
                border: `1px solid ${color}33`,
                borderRadius: '8px',
                color,
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'all 0.15s',
                fontFamily: 'Inter, sans-serif',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${color}28`
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background = `${color}18`
              }}
            >
              {t.template_type === 'CONFIRMATION' ? '✅' :
               t.template_type === 'SHORTLIST' ? '⭐' :
               t.template_type === 'REJECTION' ? '❌' : '📝'} {t.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}
