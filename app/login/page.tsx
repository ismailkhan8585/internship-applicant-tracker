'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import {
  Lock, Eye, EyeOff, ArrowRight, LoaderCircle, TriangleAlert,
  Inbox, Send, FileSpreadsheet, MessageCircle, ShieldCheck,
} from 'lucide-react'
import BrandMark from '@/components/shared/BrandMark'

const FEATURES = [
  { icon: Inbox, title: 'Gmail inbox sync', desc: 'Applicants and CVs imported straight from your inbox.' },
  { icon: Send, title: 'One-click outreach', desc: 'Confirm, shortlist or decline with branded emails.' },
  { icon: FileSpreadsheet, title: 'Excel export', desc: 'Your full applicant pipeline, ready to share.' },
]

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 600)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) return

    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      })

      const data = await res.json()

      if (res.ok && data.success) {
        toast.success('Welcome back, Admin')
        router.push('/dashboard')
        router.refresh()
      } else {
        setError(data.error || 'Incorrect password')
        triggerShake()
        setPassword('')
      }
    } catch {
      setError('Connection error. Please try again.')
      triggerShake()
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="login-shell">
      {/* ── Brand panel ── */}
      <aside
        className="login-aside"
        style={{
          position: 'relative',
          overflow: 'hidden',
          padding: '48px clamp(32px, 5vw, 72px)',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          borderRight: '1px solid var(--hairline)',
          background:
            'radial-gradient(70% 55% at 20% 20%, rgba(125,107,255,0.22), transparent 70%), radial-gradient(50% 45% at 85% 85%, rgba(208,140,255,0.14), transparent 70%)',
        }}
      >
        {/* Orbit rings */}
        <div aria-hidden style={{
          position: 'absolute', right: '-180px', top: '50%', transform: 'translateY(-50%)',
          width: '560px', height: '560px', borderRadius: '50%',
          border: '1px solid rgba(255,255,255,0.06)', pointerEvents: 'none',
        }} />
        <div aria-hidden style={{
          position: 'absolute', right: '-80px', top: '50%', transform: 'translateY(-50%)',
          width: '360px', height: '360px', borderRadius: '50%',
          border: '1px solid rgba(139,123,255,0.14)', pointerEvents: 'none',
        }} />

        <div className="fade-in" style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
          <BrandMark size={40} />
          <div>
            <div className="brand-name" style={{ fontSize: '17px' }}>MentorTechz</div>
            <div className="brand-sub">Internship Console</div>
          </div>
        </div>

        <div style={{ position: 'relative', maxWidth: '520px' }}>
          <span className="eyebrow fade-in delay-1" style={{ color: 'var(--accent)' }}>
            <span style={{ width: 18, height: 1, background: 'currentColor' }} /> Internship Program 2025
          </span>
          <h1 className="fade-in delay-2" style={{
            margin: '18px 0 0',
            fontSize: 'clamp(38px, 4.4vw, 60px)',
            fontWeight: 700,
            letterSpacing: '-0.045em',
            lineHeight: 1.02,
          }}>
            Hire the next generation of{' '}
            <span className="serif-italic text-gradient" style={{ fontSize: '1.1em' }}>builders.</span>
          </h1>
          <p className="fade-in delay-3" style={{ margin: '20px 0 0', fontSize: '15.5px', color: 'var(--text-2)', lineHeight: 1.65, maxWidth: '440px' }}>
            Every applicant, every email and every decision for your internship cohort, in one calm workspace.
          </p>

          <div className="fade-in delay-4" style={{ marginTop: '40px', display: 'grid', gap: '12px' }}>
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} style={{
                display: 'flex', alignItems: 'center', gap: '14px',
                padding: '14px 16px',
                background: 'rgba(255,255,255,0.025)',
                border: '1px solid var(--hairline)',
                borderRadius: '16px',
                backdropFilter: 'blur(8px)',
              }}>
                <span className="icon-tile" style={{ background: 'var(--accent-soft)', color: 'var(--accent)', border: '1px solid var(--accent-line)' }}>
                  <Icon size={18} />
                </span>
                <div>
                  <div style={{ fontSize: '14px', fontWeight: 650, color: 'var(--text)' }}>{title}</div>
                  <div style={{ fontSize: '12.5px', color: 'var(--text-3)', marginTop: '2px' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p style={{ position: 'relative', margin: 0, fontSize: '12px', color: 'var(--text-4)' }}>
          © 2025 MentorTechz · Software House
        </p>
      </aside>

      {/* ── Form panel ── */}
      <section style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 20px', position: 'relative',
      }}>
        <div
          className={`fade-in ${shake ? 'shake' : ''}`}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <div style={{ marginBottom: '32px' }}>
            <span className="icon-tile" style={{
              width: 48, height: 48, borderRadius: 15,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.08), rgba(255,255,255,0.02))',
              border: '1px solid var(--hairline-strong)', color: 'var(--text)',
              marginBottom: '22px',
            }}>
              <ShieldCheck size={22} />
            </span>
            <h2 style={{ margin: 0, fontSize: '30px', fontWeight: 700, letterSpacing: '-0.035em' }}>
              Welcome <span className="serif-italic" style={{ fontSize: '1.12em' }}>back</span>
            </h2>
            <p style={{ margin: '8px 0 0', fontSize: '14px', color: 'var(--text-3)' }}>
              Sign in with your admin password to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <label htmlFor="password" className="field-label">Admin password</label>
            <div className="input-icon-wrap" style={{ marginBottom: '18px' }}>
              <Lock size={16} style={{ left: 16 }} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                className="input-field input-lg"
                autoFocus
                autoComplete="current-password"
                style={{ paddingLeft: '44px', paddingRight: '50px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="icon-btn"
                style={{ position: 'absolute', right: '7px', top: '50%', transform: 'translateY(-50%)' }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {error && (
              <div style={{
                background: 'rgba(255,107,122,0.08)',
                border: '1px solid rgba(255,107,122,0.25)',
                borderRadius: '12px',
                padding: '11px 14px',
                marginBottom: '18px',
                fontSize: '13.5px',
                color: 'var(--red)',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <TriangleAlert size={16} style={{ flexShrink: 0 }} /> {error}
              </div>
            )}

            <button
              id="login-btn"
              type="submit"
              disabled={loading || !password.trim()}
              className="btn-primary btn-lg btn-block"
            >
              {loading ? (
                <><LoaderCircle size={18} className="spin" /> Signing in…</>
              ) : (
                <>Sign in <ArrowRight size={18} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '36px', paddingTop: '24px', borderTop: '1px solid var(--hairline)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <a
              href="https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp"
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-tint tint-wa btn-block"
            >
              <MessageCircle size={16} /> Join the official WhatsApp group
            </a>
            <p style={{ margin: 0, fontSize: '12.5px', color: 'var(--text-3)', textAlign: 'center' }}>
              Need help? <span style={{ color: 'var(--text-2)' }}>softwarehousementor@gmail.com</span>
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}
