'use client'

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
  onSelectApplicant,
}: RecipientSelectorProps) {
  const options = [
    {
      key: 'PENDING' as const,
      icon: '⏳',
      label: `Pending Only (${pendingCount.toLocaleString()} applicants)`,
      desc: 'Will only email those not yet confirmed',
      color: '#f59e0b',
    },
    {
      key: 'ALL' as const,
      icon: '👥',
      label: `All Applicants (${totalCount.toLocaleString()})`,
      desc: 'Sends to everyone including confirmed',
      color: '#667eea',
    },
    {
      key: 'ONE' as const,
      icon: '👤',
      label: 'One Person',
      desc: 'Search by name or email',
      color: '#22c55e',
    },
  ]

  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '10px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
        Send To
      </label>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {options.map((opt) => (
          <button
            key={opt.key}
            id={`recipient-${opt.key.toLowerCase()}`}
            onClick={() => onModeChange(opt.key)}
            style={{
              background: mode === opt.key ? `rgba(${opt.color === '#f59e0b' ? '245,158,11' : opt.color === '#667eea' ? '102,126,234' : '34,197,94'},0.12)` : 'rgba(255,255,255,0.04)',
              border: `1px solid ${mode === opt.key ? opt.color + '55' : 'rgba(255,255,255,0.08)'}`,
              borderRadius: '12px',
              padding: '14px 16px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.15s',
              width: '100%',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '18px' }}>{opt.icon}</span>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: mode === opt.key ? '#e2e8f0' : '#94a3b8' }}>
                  {opt.label}
                </div>
                <div style={{ fontSize: '12px', color: '#475569', marginTop: '2px' }}>
                  {opt.desc}
                </div>
              </div>
              {mode === opt.key && (
                <span style={{ marginLeft: 'auto', fontSize: '16px', color: opt.color }}>✓</span>
              )}
            </div>
          </button>
        ))}
      </div>

      {mode === 'ONE' && (
        <div style={{ marginTop: '12px', position: 'relative' }}>
          <span style={{
            position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
            fontSize: '14px', pointerEvents: 'none',
          }}>🔍</span>
          <input
            id="one-person-search"
            type="text"
            placeholder="Type name or email..."
            value={oneModeSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            className="input-field"
            style={{ paddingLeft: '36px' }}
          />
          {oneEmail && (
            <div style={{
              marginTop: '8px',
              padding: '10px 14px',
              background: 'rgba(34,197,94,0.1)',
              border: '1px solid rgba(34,197,94,0.25)',
              borderRadius: '10px',
              fontSize: '13px',
              color: '#86efac',
              fontWeight: 600,
            }}>
              ✓ Selected: {oneEmail}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
