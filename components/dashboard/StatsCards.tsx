'use client'

import { useEffect, useState, useRef } from 'react'

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
      const elapsed = timestamp - startTime.current
      const progress = Math.min(elapsed / duration, 1)
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3)
      setCount(Math.floor(eased * target))
      if (progress < 1) {
        raf.current = requestAnimationFrame(animate)
      } else {
        setCount(target)
      }
    }

    raf.current = requestAnimationFrame(animate)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [target, duration])

  return <>{count.toLocaleString()}</>
}

interface StatCardProps {
  label: string
  value: number
  icon: string
  color: string
  borderColor: string
  bgColor: string
}

function StatCard({ label, value, icon, color, borderColor, bgColor }: StatCardProps) {
  return (
    <div style={{
      background: bgColor,
      border: `1px solid ${borderColor}`,
      borderRadius: '16px',
      padding: '20px 24px',
      flex: 1,
      minWidth: '0',
      transition: 'transform 0.2s, box-shadow 0.2s',
    }}
    onMouseEnter={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = `0 8px 24px ${borderColor}40`
    }}
    onMouseLeave={(e) => {
      (e.currentTarget as HTMLDivElement).style.transform = 'none'
      ;(e.currentTarget as HTMLDivElement).style.boxShadow = 'none'
    }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
        <span style={{ fontSize: '20px' }}>{icon}</span>
        <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </span>
      </div>
      <div style={{ fontSize: '36px', fontWeight: 800, color, lineHeight: 1, letterSpacing: '-1px' }}>
        <CountUpNumber target={value} />
      </div>
    </div>
  )
}

export default function StatsCards({ stats }: { stats: Stats }) {
  const cards = [
    {
      label: 'Total', value: stats.total, icon: '👥',
      color: '#a78bfa', borderColor: 'rgba(139,92,246,0.3)', bgColor: 'rgba(139,92,246,0.08)',
    },
    {
      label: 'Pending', value: stats.pending, icon: '⏳',
      color: '#fcd34d', borderColor: 'rgba(245,158,11,0.3)', bgColor: 'rgba(245,158,11,0.08)',
    },
    {
      label: 'Confirmed', value: stats.confirmed, icon: '✅',
      color: '#86efac', borderColor: 'rgba(34,197,94,0.3)', bgColor: 'rgba(34,197,94,0.08)',
    },
    {
      label: 'Shortlisted', value: stats.shortlisted, icon: '⭐',
      color: '#93c5fd', borderColor: 'rgba(59,130,246,0.3)', bgColor: 'rgba(59,130,246,0.08)',
    },
  ]

  return (
    <div className="stats-grid">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  )
}
