'use client'

interface BulkResult {
  sent: number
  skipped: number
  failed: number
  total: number
}

interface SendProgressModalProps {
  isOpen: boolean
  isSending: boolean
  result: BulkResult | null
  recipientLabel: string
  emailsSentToday: number
  dailyLimit: number
  onClose: () => void
  onStop?: () => void
}

export default function SendProgressModal({
  isOpen,
  isSending,
  result,
  recipientLabel,
  emailsSentToday,
  dailyLimit,
  onClose,
  onStop,
}: SendProgressModalProps) {
  if (!isOpen) return null

  const sent = result?.sent ?? 0
  const total = result?.total ?? 0
  const failed = result?.failed ?? 0
  const skipped = result?.skipped ?? 0
  const pct = total > 0 ? Math.round((sent / total) * 100) : 0
  const dailyPct = dailyLimit > 0 ? Math.min((emailsSentToday / dailyLimit) * 100, 100) : 0

  return (
    <div className="modal-backdrop" onClick={isSending ? undefined : onClose}>
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>
            {isSending ? '📧' : result && failed === 0 ? '🎉' : '📊'}
          </div>
          <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#e2e8f0' }}>
            {isSending ? 'Sending Emails...' : 'Send Complete'}
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: '13px', color: '#64748b' }}>
            {recipientLabel}
          </p>
        </div>

        {/* Progress bar */}
        {total > 0 && (
          <div style={{ marginBottom: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '13px', color: '#94a3b8' }}>Progress</span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: '#e2e8f0' }}>{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {/* Stats grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
          marginBottom: '20px',
        }}>
          {[
            { label: '✅ Sent', value: sent, color: '#86efac' },
            { label: '⏳ Remaining', value: Math.max(0, total - sent - failed), color: '#94a3b8' },
            { label: '❌ Failed', value: failed, color: '#fca5a5' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '10px',
              padding: '12px',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '20px', fontWeight: 800, color: stat.color }}>{stat.value}</div>
              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Daily limit bar */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>Daily limit</span>
            <span style={{ fontSize: '12px', color: '#94a3b8' }}>{emailsSentToday}/{dailyLimit}</span>
          </div>
          <div className="progress-bar-track" style={{ height: '5px' }}>
            <div className="progress-bar-fill" style={{
              width: `${dailyPct}%`,
              ...(dailyPct >= 90 ? { background: '#ef4444' } : {}),
            }} />
          </div>
          {skipped > 0 && (
            <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#f59e0b' }}>
              ⚠️ {skipped} emails skipped — daily limit reached. Will continue tomorrow.
            </p>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          {isSending && onStop && (
            <button
              onClick={onStop}
              style={{
                padding: '10px 24px', borderRadius: '10px',
                background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)',
                color: '#fca5a5', cursor: 'pointer', fontSize: '14px', fontWeight: 600,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              ⏹️ Stop Sending
            </button>
          )}
          {!isSending && (
            <button onClick={onClose} className="btn-primary" style={{ padding: '10px 28px' }}>
              Done ✓
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
