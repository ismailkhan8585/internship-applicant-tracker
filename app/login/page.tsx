'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

export default function LoginPage() {
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [shake, setShake] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()
  const cardRef = useRef<HTMLDivElement>(null)

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
        toast.success('Welcome back, Admin! 🚀')
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
    <main
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
        padding: '20px',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Decorative blobs */}
      <div style={{
        position: 'absolute', top: '-100px', left: '-100px',
        width: '400px', height: '400px',
        background: 'radial-gradient(circle, rgba(102,126,234,0.15) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', bottom: '-100px', right: '-100px',
        width: '500px', height: '500px',
        background: 'radial-gradient(circle, rgba(118,75,162,0.12) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none',
      }} />

      <div
        ref={cardRef}
        className={shake ? 'shake' : ''}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(255,255,255,0.05)',
          border: '1px solid rgba(255,255,255,0.12)',
          borderRadius: '24px',
          padding: '48px 40px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.4), 0 0 0 1px rgba(102,126,234,0.1)',
          animation: 'fadeIn 0.5s ease',
        }}
      >
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{
            width: '72px', height: '72px',
            background: 'linear-gradient(135deg, #667eea, #764ba2)',
            borderRadius: '20px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px',
            boxShadow: '0 8px 24px rgba(102,126,234,0.4)',
          }}>
            🚀
          </div>
          <h1 style={{
            margin: 0,
            fontSize: '26px',
            fontWeight: 800,
            color: '#e2e8f0',
            letterSpacing: '-0.5px',
          }}>
            MentorTechz
          </h1>
          <p style={{
            margin: '6px 0 0',
            fontSize: '14px',
            color: '#94a3b8',
            fontWeight: 500,
          }}>
            Internship Manager · Admin Access
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#94a3b8',
              marginBottom: '8px',
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
            }}>
              Admin Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="input-field"
                autoFocus
                autoComplete="current-password"
                style={{ paddingRight: '44px' }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none', border: 'none',
                  color: '#64748b', cursor: 'pointer', fontSize: '18px',
                  padding: '4px', lineHeight: 1,
                }}
                title={showPassword ? 'Hide' : 'Show'}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {error && (
            <div style={{
              background: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '10px',
              padding: '10px 14px',
              marginBottom: '20px',
              fontSize: '14px',
              color: '#fca5a5',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              ⚠️ {error}
            </div>
          )}

          <button
            id="login-btn"
            type="submit"
            disabled={loading || !password.trim()}
            className="btn-primary"
            style={{ width: '100%', padding: '14px', fontSize: '16px', borderRadius: '12px' }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                <span style={{
                  width: '16px', height: '16px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }} />
                Signing in...
              </span>
            ) : (
              '🔐 Sign In'
            )}
          </button>
        </form>

        {/* Footer */}
        <div style={{
          marginTop: '32px',
          paddingTop: '24px',
          borderTop: '1px solid rgba(255,255,255,0.08)',
          textAlign: 'center',
        }}>
          <a
            href="https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
              color: '#4ade80',
              textDecoration: 'none',
              marginBottom: '10px',
              fontWeight: 500,
            }}
          >
            <span>📱</span> Join Official WhatsApp Group
          </a>
          <p style={{ margin: 0, fontSize: '12px', color: '#475569' }}>
            softwarehousementor@gmail.com
          </p>
          <p style={{ margin: '4px 0 0', fontSize: '11px', color: '#334155' }}>
            MentorTechz · Internship Program 2025
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </main>
  )
}
