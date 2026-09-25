'use client'

export default function DailyLimitBar({
  sent,
  limit,
}: {
  sent: number
  limit: number
}) {
  const pct = limit > 0 ? Math.min((sent / limit) * 100, 100) : 0
  const isDanger = pct >= 90
  const isWarning = pct >= 70

  const color = isDanger ? '#ef4444' : isWarning ? '#f59e0b' : '#667eea'
  const trackLabel = isDanger ? 'danger' : ''

  return (
    <div
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: `1px solid ${isDanger ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.08)'}`,
        borderRadius: '12px',
        padding: '14px 18px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        flexWrap: 'wrap',
      }}
    >
      <span style={{ fontSize: '13px', color: '#94a3b8', fontWeight: 600, whiteSpace: 'nowrap' }}>
        📧 Daily Limit
      </span>

      <div style={{ flex: 1, minWidth: '120px' }}>
        <div className="progress-bar-track">
          <div
            className={`progress-bar-fill ${trackLabel}`}
            style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}, ${color}cc)` }}
          />
        </div>
      </div>

      <span
        style={{
          fontSize: '13px',
          fontWeight: 700,
          color,
          whiteSpace: 'nowrap',
        }}
      >
        {sent.toLocaleString()} / {limit.toLocaleString()} used today
      </span>

      {isDanger && (
        <span
          style={{
            fontSize: '11px',
            background: 'rgba(239,68,68,0.15)',
            border: '1px solid rgba(239,68,68,0.25)',
            color: '#fca5a5',
            borderRadius: '99px',
            padding: '2px 8px',
            fontWeight: 600,
          }}
        >
          ⚠️ Near limit
        </span>
      )}
    </div>
  )
}
