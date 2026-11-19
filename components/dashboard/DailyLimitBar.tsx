'use client'

import { Gauge, TriangleAlert } from 'lucide-react'

export default function DailyLimitBar({ sent, limit }: { sent: number; limit: number }) {
  const pct = limit > 0 ? Math.min((sent / limit) * 100, 100) : 0
  const isDanger = pct >= 90
  const isWarning = pct >= 70
  const remaining = Math.max(0, limit - sent)

  const rgb = isDanger ? '255,107,122' : isWarning ? '245,184,75' : '139,123,255'
  const fillCls = isDanger ? 'danger' : isWarning ? 'warning' : ''

  return (
    <div
      className="surface"
      style={{
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '18px',
        flexWrap: 'wrap',
        borderColor: isDanger ? 'rgba(255,107,122,0.3)' : undefined,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: '180px' }}>
        <span className="icon-tile" style={{ width: 34, height: 34, borderRadius: 10, background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.22)`, color: `rgb(${rgb})` }}>
          <Gauge size={16} />
        </span>
        <div>
          <div style={{ fontSize: '13px', fontWeight: 650, color: 'var(--text)' }}>Daily send quota</div>
          <div style={{ fontSize: '12px', color: 'var(--text-3)' }}>
            <span className="tabular">{remaining.toLocaleString()}</span> emails left today
          </div>
        </div>
      </div>

      <div style={{ flex: 1, minWidth: '160px' }}>
        <div className="progress-bar-track" style={{ height: '6px' }}>
          <div className={`progress-bar-fill ${fillCls}`} style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="tabular" style={{ fontSize: '13px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
          <strong style={{ color: 'var(--text)', fontWeight: 700 }}>{sent.toLocaleString()}</strong> / {limit.toLocaleString()}
        </span>
        {isDanger && (
          <span className="badge badge-rejected">
            <TriangleAlert size={12} /> Near limit
          </span>
        )}
      </div>
    </div>
  )
}
