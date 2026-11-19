'use client'

import { Send, PartyPopper, ChartColumn, Square, Check, TriangleAlert } from 'lucide-react'

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

  const HeadIcon = isSending ? Send : result && failed === 0 ? PartyPopper : ChartColumn

  return (
    <div className="modal-backdrop" onClick={isSending ? undefined : onClose}>
      <div className="modal-content" style={{ maxWidth: '460px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ textAlign: 'center', marginBottom: 26 }}>
          <span className="icon-tile" style={{
            width: 60, height: 60, borderRadius: 20, marginBottom: 16,
            background: 'var(--accent-grad)', color: '#fff',
            boxShadow: '0 14px 34px -10px rgba(139,123,255,0.8), inset 0 1px 0 rgba(255,255,255,0.3)',
            animation: isSending ? 'float 2.4s ease-in-out infinite' : undefined,
          }}>
            <HeadIcon size={26} />
          </span>
          <h3 style={{ margin: 0, fontSize: 22, fontWeight: 700, letterSpacing: '-0.03em' }}>
            {isSending ? <>Sending <span className="serif-italic">emails…</span></> : <>Send <span className="serif-italic">complete</span></>}
          </h3>
          <p style={{ margin: '6px 0 0', fontSize: 13, color: 'var(--text-3)' }}>{recipientLabel}</p>
        </div>

        {total > 0 && (
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: 'var(--text-2)' }}>Progress</span>
              <span className="tabular" style={{ fontWeight: 700 }}>{pct}%</span>
            </div>
            <div className="progress-bar-track">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 20 }}>
          {[
            { label: 'Sent', value: sent, color: 'var(--green)' },
            { label: 'Remaining', value: Math.max(0, total - sent - failed), color: 'var(--text-2)' },
            { label: 'Failed', value: failed, color: 'var(--red)' },
          ].map((stat) => (
            <div key={stat.label} style={{
              background: 'rgba(255,255,255,0.025)', border: '1px solid var(--hairline)',
              borderRadius: 14, padding: '14px 10px', textAlign: 'center',
            }}>
              <div className="tabular" style={{ fontSize: 24, fontWeight: 700, color: stat.color, letterSpacing: '-0.03em' }}>{stat.value}</div>
              <div style={{ fontSize: 11.5, color: 'var(--text-3)', marginTop: 2 }}>{stat.label}</div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: 22 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6, fontSize: 12, color: 'var(--text-3)' }}>
            <span>Daily quota</span>
            <span className="tabular">{emailsSentToday}/{dailyLimit}</span>
          </div>
          <div className="progress-bar-track" style={{ height: 5 }}>
            <div className={`progress-bar-fill ${dailyPct >= 90 ? 'danger' : ''}`} style={{ width: `${dailyPct}%` }} />
          </div>
          {skipped > 0 && (
            <p style={{ margin: '10px 0 0', fontSize: 12.5, color: 'var(--amber)', display: 'flex', gap: 8, alignItems: 'center' }}>
              <TriangleAlert size={14} /> {skipped} emails skipped — daily limit reached. Continue tomorrow.
            </p>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          {isSending && onStop && (
            <button onClick={onStop} className="btn btn-tint tint-red">
              <Square size={14} /> Stop sending
            </button>
          )}
          {!isSending && (
            <button onClick={onClose} className="btn-primary" style={{ minWidth: 140 }}>
              <Check size={16} /> Done
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
