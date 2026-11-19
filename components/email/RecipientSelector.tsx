'use client'

import { Clock, Users, UserRound, Search, Check, CircleCheck } from 'lucide-react'

interface RecipientSelectorProps {
  mode: 'PENDING' | 'ALL' | 'ONE'
  pendingCount: number
  totalCount: number
  oneEmail: string
  oneModeSearch: string
  onModeChange: (mode: 'PENDING' | 'ALL' | 'ONE') => void
  onSearchChange: (val: string) => void
  onSelectApplicant: (applicant: { id: string; name: string; email: string }) => void
}

export default function RecipientSelector({
  mode,
  pendingCount,
  totalCount,
  oneEmail,
  oneModeSearch,
  onModeChange,
  onSearchChange,
}: RecipientSelectorProps) {
  const options = [
    { key: 'PENDING' as const, icon: Clock, label: 'Pending only', count: pendingCount, desc: 'Not yet confirmed', rgb: '245,184,75' },
    { key: 'ALL' as const, icon: Users, label: 'Everyone', count: totalCount, desc: 'All applicants', rgb: '139,123,255' },
    { key: 'ONE' as const, icon: UserRound, label: 'One person', count: null, desc: 'Search by name', rgb: '61,220,151' },
  ]

  return (
    <div>
      <div className="section-head">
        <span className="section-step">01</span>
        <div>
          <h3 className="section-title">Recipients</h3>
          <p className="section-desc">Who should receive this email?</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10 }}>
        {options.map(({ key, icon: Icon, label, count, desc, rgb }) => {
          const active = mode === key
          return (
            <button
              key={key}
              id={`recipient-${key.toLowerCase()}`}
              onClick={() => onModeChange(key)}
              style={{
                position: 'relative',
                textAlign: 'left',
                padding: 14,
                borderRadius: 14,
                cursor: 'pointer',
                background: active ? `linear-gradient(160deg, rgba(${rgb},0.14), rgba(${rgb},0.03))` : 'rgba(255,255,255,0.02)',
                border: `1px solid ${active ? `rgba(${rgb},0.45)` : 'var(--hairline)'}`,
                boxShadow: active ? `0 8px 24px -12px rgba(${rgb},0.6)` : 'none',
                transition: 'all 0.2s ease',
                color: 'var(--text)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="icon-tile" style={{
                  width: 32, height: 32, borderRadius: 10,
                  background: `rgba(${rgb},0.12)`, color: `rgb(${rgb})`,
                }}>
                  <Icon size={16} />
                </span>
                <span style={{
                  width: 18, height: 18, borderRadius: '50%',
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  border: `1.5px solid ${active ? `rgb(${rgb})` : 'var(--hairline-strong)'}`,
                  background: active ? `rgb(${rgb})` : 'transparent',
                  color: '#07080d',
                  transition: 'all 0.2s',
                }}>
                  {active && <Check size={11} strokeWidth={3.5} />}
                </span>
              </div>
              <div style={{ marginTop: 12, fontSize: 13.5, fontWeight: 650 }}>{label}</div>
              <div style={{ marginTop: 2, fontSize: 12, color: 'var(--text-3)' }}>
                {count !== null ? <><span className="tabular" style={{ color: active ? `rgb(${rgb})` : 'var(--text-2)', fontWeight: 600 }}>{count.toLocaleString()}</span> · {desc}</> : desc}
              </div>
            </button>
          )
        })}
      </div>

      {mode === 'ONE' && (
        <div style={{ marginTop: 14 }}>
          <div className="input-icon-wrap">
            <Search size={16} />
            <input
              id="one-person-search"
              type="text"
              placeholder="Type a name or email…"
              value={oneModeSearch}
              onChange={(e) => onSearchChange(e.target.value)}
              className="input-field"
              autoFocus
            />
          </div>
          {oneEmail && (
            <div style={{
              marginTop: 10, padding: '10px 14px', borderRadius: 12,
              display: 'flex', alignItems: 'center', gap: 10,
              background: 'rgba(61,220,151,0.08)', border: '1px solid rgba(61,220,151,0.25)',
              fontSize: 13, color: 'var(--green)', fontWeight: 600,
            }}>
              <CircleCheck size={16} /> Sending to <span style={{ color: 'var(--text)' }}>{oneEmail}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
