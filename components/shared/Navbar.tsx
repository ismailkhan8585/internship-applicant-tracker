'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { toast } from 'sonner'
import { LayoutDashboard, Mail, LogOut, MessageCircle, MailPlus } from 'lucide-react'
import BrandMark from './BrandMark'

const LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/email', label: 'Compose', icon: Mail },
]

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

  const links = LINKS.map(({ href, label, icon: Icon }) => (
    <Link key={href} href={href} className={`nav-link${pathname === href ? ' active' : ''}`}>
      <Icon size={16} strokeWidth={2} />
      {label}
    </Link>
  ))

  return (
    <>
      <header className="topbar">
        <nav className="topbar-inner">
          <Link href="/dashboard" className="brand">
            <BrandMark size={36} />
            <div>
              <div className="brand-name">MentorTechz</div>
              <div className="brand-sub">Internship Console</div>
            </div>
          </Link>

          <div className="nav-links-desktop">{links}</div>

          <div className="nav-actions">
            <a
              id="whatsapp-group-btn"
              href={process.env.NEXT_PUBLIC_WHATSAPP_GROUP || 'https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-tint tint-wa"
              title="Open Official WhatsApp Group"
            >
              <MessageCircle size={15} />
              <span className="nav-btn-text">WhatsApp</span>
            </a>
            <button
              id="connect-gmail-btn"
              onClick={handleConnectGmail}
              className="btn btn-sm btn-secondary"
              title="Connect Gmail Account"
            >
              <MailPlus size={15} />
              <span className="nav-btn-text">Connect Gmail</span>
            </button>
            <button id="logout-btn" onClick={handleLogout} className="icon-btn" title="Log out" aria-label="Log out">
              <LogOut size={16} />
            </button>
          </div>
        </nav>
      </header>

      <nav className="mobile-tabbar" aria-label="Primary">{links}</nav>
    </>
  )
}
