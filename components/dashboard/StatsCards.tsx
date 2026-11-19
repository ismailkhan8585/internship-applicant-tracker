'use client'

import { useEffect, useState, useRef } from 'react'
import type { LucideIcon } from 'lucide-react'
import { Users, Clock, BadgeCheck, Star } from 'lucide-react'

interface Stats {
  total: number
  pending: number
  confirmed: number
  shortlisted: number
  rejected: number
  emailsSentToday: number
  dailyLimit: number
  lastGmailSync: string | null
}

function CountUpNumber({ target, duration = 1200 }: { target: number; duration?: number }) {
  const [count, setCount] = useState(0)
  const startTime = useRef<number | null>(null)
  const raf = useRef<number | null>(null)

  useEffect(() => {
    if (target === 0) { setCount(0); return }
    startTime.current = null

    const animate = (timestamp: number) => {
      if (!startTime.current) startTime.current = timestamp
      const progress = Math.min((timestamp - startTime.current) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) raf.current = requestAnimationFrame(animate)
      else setCount(target)
    }

    raf.current = requestAnimationFrame(animate)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return <>{count.toLocaleString()}</>
}

interface StatCardProps {
  label: string
  value: number
  icon: LucideIcon
  rgb: string
  caption: string
  share?: number
  index: number
}

function StatCard({ label, value, icon: Icon, rgb, caption, share, index }: StatCardProps) {
  return (
    <div
      className={`surface fade-in delay-${index + 1}`}
      style={{
        padding: '20px 22px',
        overflow: 'hidden',
        minWidth: 0,
        transition: 'transform 0.25s ease, border-color 0.25s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)'
        e.currentTarget.style.borderColor = `rgba(${rgb},0.3)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'none'
        e.currentTarget.style.borderColor = ''
      }}
    >
      {/* Corner glow */}
      <div aria-hidden style={{
        position: 'absolute', top: '-60px', right: '-60px', width: '160px', height: '160px',
        background: `radial-gradient(circle, rgba(${rgb},0.18), transparent 70%)`,
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
        <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-2)' }}>{label}</span>
        <span className="icon-tile" style={{
          width: 34, height: 34, borderRadius: 10,
          background: `rgba(${rgb},0.1)`, border: `1px solid rgba(${rgb},0.22)`, color: `rgb(${rgb})`,
        }}>
          <Icon size={16} strokeWidth={2.2} />
        </span>
      </div>

      <div className="stat-number tabular" style={{
        position: 'relative',
        marginTop: '14px',
        fontSize: '38px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.04em', color: 'var(--text)',
      }}>
        <CountUpNumber target={value} />
      </div>

      <div style={{ position: 'relative', marginTop: '16px' }}>
        {share !== undefined ? (
          <>
            <div style={{ height: 4, borderRadius: 99, background: 'rgba(255,255,255,0.05)', overflow: 'hidden' }}>
              <div style={{
                width: `${share}%`, height: '100%', borderRadius: 99,
                background: `rgb(${rgb})`, boxShadow: `0 0 10px rgba(${rgb},0.6)`,
                transition: 'width 1s cubic-bezier(0.22,1,0.36,1)',
              }} />
            </div>
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text-3)' }}>
              <span className="tabular" style={{ color: `rgb(${rgb})`, fontWeight: 600 }}>{share}%</span> {caption}
            </div>
          </>
        ) : (
          <div style={{ fontSize: '12px', color: 'var(--text-3)', paddingTop: '12px' }}>{caption}</div>
        )}
      </div>
    </div>
  )
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const pct = (n: number) => (stats.total > 0 ? Math.round((n / stats.total) * 100) : 0)

  const cards = [
    { label: 'Total applicants', value: stats.total, icon: Users, rgb: '139,123,255', caption: 'All synced from Gmail' },
    { label: 'Pending review', value: stats.pending, icon: Clock, rgb: '245,184,75', caption: 'of total awaiting a reply', share: pct(stats.pending) },
    { label: 'Confirmed', value: stats.confirmed, icon: BadgeCheck, rgb: '61,220,151', caption: 'of total confirmed', share: pct(stats.confirmed) },
    { label: 'Shortlisted', value: stats.shortlisted, icon: Star, rgb: '94,168,255', caption: 'of total shortlisted', share: pct(stats.shortlisted) },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card, i) => (
        <StatCard key={card.label} index={i} {...card} />
      ))}
    </div>
  )
}
