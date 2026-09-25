'use client'

import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    toast.success('Logged out successfully')
    router.push('/login')
    router.refresh()
  }

  const handleConnectGmail = () => {
    window.location.href = '/api/auth/gmail'
  }

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.04)',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      backdropFilter: 'blur(20px)',
      padding: '0 24px',
      height: '64px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      {/* Logo */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
        <div style={{
          width: '38px', height: '38px',
          background: 'linear-gradient(135deg, #667eea, #764ba2)',
          borderRadius: '10px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '18px',
          boxShadow: '0 4px 12px rgba(102,126,234,0.35)',
          flexShrink: 0,
        }}>
          🚀
        </div>
        <div>
          <div style={{ fontWeight: 800, fontSize: '16px', color: '#e2e8f0', lineHeight: 1.2 }}>
            MentorTechz
          </div>
          <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 500 }}>
            Internship Manager
          </div>
        </div>
      </div>

      {/* Nav links — hidden on mobile via CSS class */}
      <div className="nav-links-desktop">
        <a
          href="/dashboard"
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            color: pathname === '/dashboard' ? '#667eea' : '#94a3b8',
            background: pathname === '/dashboard' ? 'rgba(102,126,234,0.12)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          📊 Dashboard
        </a>
        <a
          href="/email"
          style={{
            padding: '6px 14px',
            borderRadius: '8px',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            color: pathname === '/email' ? '#667eea' : '#94a3b8',
            background: pathname === '/email' ? 'rgba(102,126,234,0.12)' : 'transparent',
            transition: 'all 0.15s',
          }}
        >
          ✉️ Email
        </a>
      </div>

      {/* Actions */}
      <div className="nav-actions">
        <a
          id="whatsapp-group-btn"
          href={process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px',
            background: 'rgba(37,211,102,0.12)',
            border: '1px solid rgba(37,211,102,0.3)',
            borderRadius: '8px',
            color: '#25D366',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
          title="Open Official WhatsApp Group"
        >
          💬 <span className="nav-whatsapp-text">WhatsApp</span>
        </a>
        <button
          id="connect-gmail-btn"
          onClick={handleConnectGmail}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px',
            background: 'rgba(234,102,102,0.1)',
            border: '1px solid rgba(234,102,102,0.25)',
            borderRadius: '8px',
            color: '#f87171',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
          title="Connect Gmail Account"
        >
          📧 <span className="nav-gmail-text">Gmail</span>
        </button>
        <button
          id="logout-btn"
          onClick={handleLogout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            padding: '7px 12px',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#94a3b8',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 600,
            transition: 'all 0.15s',
            fontFamily: 'Inter, sans-serif',
            whiteSpace: 'nowrap',
          }}
        >
          🚪 <span className="nav-logout-text">Logout</span>
        </button>
      </div>
    </nav>
  )
}
