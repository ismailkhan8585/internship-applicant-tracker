'use client'

import { BadgeCheck, Star, CircleX, SquarePen } from 'lucide-react'

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

const TYPE_STYLE: Record<string, { tint: string; icon: typeof BadgeCheck }> = {
  CONFIRMATION: { tint: 'tint-green', icon: BadgeCheck },
  SHORTLIST: { tint: 'tint-blue', icon: Star },
  REJECTION: { tint: 'tint-red', icon: CircleX },
  CUSTOM: { tint: '', icon: SquarePen },
}

export default function TemplateSelector({ templates, onLoad }: TemplateSelectorProps) {
  return (
    <div>
      <div className="section-head">
        <span className="section-step">02</span>
        <div>
          <h3 className="section-title">Start from a template</h3>
          <p className="section-desc">Load a saved message, then fine-tune it below.</p>
        </div>
      </div>

      {templates.length === 0 ? (
        <p style={{ margin: 0, fontSize: 13, color: 'var(--text-3)' }}>No templates saved yet.</p>
      ) : (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {templates.map((t) => {
            const style = TYPE_STYLE[t.template_type] || TYPE_STYLE.CUSTOM
            const Icon = style.icon
            return (
              <button
                key={t.id}
                id={`template-${t.id}`}
                onClick={() => onLoad(t)}
                className={`btn btn-sm btn-tint ${style.tint}`}
              >
                <Icon size={14} /> {t.name}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
