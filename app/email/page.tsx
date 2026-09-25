'use client'

import { useState, useEffect, useCallback, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import RecipientSelector from '@/components/email/RecipientSelector'
import TemplateSelector from '@/components/email/TemplateSelector'
import MessageComposer from '@/components/email/MessageComposer'
import EmailPreview from '@/components/email/EmailPreview'
import SendProgressModal from '@/components/email/SendProgressModal'

interface Template {
  id: string
  name: string
  subject: string
  message: string
  template_type: string
}

interface ApplicantSearch {
  id: string
  name: string
  email: string
  status: string
}

function EmailPageContent() {
  const searchParams = useSearchParams()
  const [mode, setMode] = useState<'PENDING' | 'ALL' | 'ONE'>('PENDING')
  const [oneModeSearch, setOneModeSearch] = useState('')
  const [oneApplicant, setOneApplicant] = useState<{ id: string; name: string; email: string } | null>(null)
  const [searchResults, setSearchResults] = useState<ApplicantSearch[]>([])
  const [showResults, setShowResults] = useState(false)
  const [templates, setTemplates] = useState<Template[]>([])
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [emailType, setEmailType] = useState<'CONFIRMATION' | 'REJECTION' | 'SHORTLIST' | 'CUSTOM'>('CONFIRMATION')
  const [stats, setStats] = useState({ pending: 0, total: 0, emailsSentToday: 0, dailyLimit: 500 })
  const [sending, setSending] = useState(false)
  const [showProgress, setShowProgress] = useState(false)
  const [bulkResult, setBulkResult] = useState<{ sent: number; skipped: number; failed: number; total: number } | null>(null)
  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Pre-fill from query params (when clicking "Send Email" from dashboard)
  useEffect(() => {
    const toEmail = searchParams.get('to')
    const toName = searchParams.get('name')
    const toId = searchParams.get('id')
    if (toEmail && toName && toId) {
      setMode('ONE')
      setOneApplicant({ id: toId, name: toName, email: toEmail })
      setOneModeSearch(toName)
    }
  }, [])

  useEffect(() => {
    fetch('/api/templates')
      .then((r) => r.json())
      .then((d) => setTemplates(d.templates || []))
    fetch('/api/applicants/stats')
      .then((r) => r.json())
      .then((d) => setStats({
        pending: d.pending,
        total: d.total,
        emailsSentToday: d.emailsSentToday,
        dailyLimit: d.dailyLimit,
      }))
  }, [])

  // Search applicants for ONE mode
  useEffect(() => {
    if (mode !== 'ONE' || !oneModeSearch.trim()) {
      setSearchResults([])
      return
    }
    if (searchDebounce.current) clearTimeout(searchDebounce.current)
    searchDebounce.current = setTimeout(async () => {
      const res = await fetch(`/api/applicants?search=${encodeURIComponent(oneModeSearch)}&limit=5`)
      const data = await res.json()
      setSearchResults(data.applicants || [])
      setShowResults(true)
    }, 300)
  }, [oneModeSearch, mode])

  const handleLoadTemplate = (template: Template) => {
    setSubject(template.subject)
    setMessage(template.message)
    setEmailType(template.template_type as any)
    toast.success(`Template "${template.name}" loaded`)
  }

  const getRecipientCount = () => {
    if (mode === 'ONE') return oneApplicant ? 1 : 0
    if (mode === 'PENDING') return stats.pending
    return stats.total
  }

  const getRecipientLabel = () => {
    if (mode === 'ONE' && oneApplicant) return oneApplicant.name
    if (mode === 'PENDING') return `${stats.pending} Pending Applicants`
    return `${stats.total} All Applicants`
  }

  const handleSend = async () => {
    if (!subject.trim()) { toast.error('Please enter an email subject'); return }
    if (!message.trim()) { toast.error('Please enter a message'); return }
    if (mode === 'ONE' && !oneApplicant) { toast.error('Please select a recipient'); return }

    setSending(true)

    if (mode === 'ONE' && oneApplicant) {
      // Single send
      try {
        const res = await fetch('/api/gmail/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to: oneApplicant.email,
            name: oneApplicant.name,
            subject,
            message,
            emailType,
            applicantId: oneApplicant.id,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          toast.success(`✅ Email sent to ${oneApplicant.name}!`)
        } else {
          toast.error(data.error || 'Failed to send email')
        }
      } catch {
        toast.error('Network error')
      } finally {
        setSending(false)
      }
    } else {
      // Bulk send
      setShowProgress(true)
      setBulkResult(null)
      try {
        const targetStatus = mode === 'PENDING' ? 'PENDING' : 'ALL'
        const res = await fetch('/api/gmail/send-bulk', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: targetStatus === 'ALL' ? undefined : targetStatus,
            subject,
            message,
            emailType,
          }),
        })
        const data = await res.json()
        if (res.ok) {
          setBulkResult(data)
          toast.success(`Done! Sent ${data.sent} emails.`)
        } else {
          toast.error(data.error || 'Bulk send failed')
          setShowProgress(false)
        }
      } catch {
        toast.error('Network error')
        setShowProgress(false)
      } finally {
        setSending(false)
      }
    }
  }

  const previewName = mode === 'ONE' && oneApplicant ? oneApplicant.name : 'Muhammad Ali'
  const previewEmail = mode === 'ONE' && oneApplicant ? oneApplicant.email : 'applicant@example.com'
  const recipientCount = getRecipientCount()

  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Page header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
            ✉️ Email Composer
          </h1>
          <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
            Send personalized emails to applicants via Gmail
          </p>
        </div>

        {/* Two-column layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>

          {/* LEFT — Compose */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Section: Send To */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <RecipientSelector
                mode={mode}
                pendingCount={stats.pending}
                totalCount={stats.total}
                oneEmail={oneApplicant?.email || ''}
                oneModeSearch={oneModeSearch}
                onModeChange={(m) => { setMode(m); setOneApplicant(null); setOneModeSearch('') }}
                onSearchChange={setOneModeSearch}
                onSelectApplicant={(a) => { setOneApplicant(a); setOneModeSearch(a.name); setShowResults(false) }}
              />
              {/* Dropdown search results */}
              {showResults && searchResults.length > 0 && (
                <div style={{
                  marginTop: '4px',
                  background: '#1e2a4a',
                  border: '1px solid rgba(255,255,255,0.12)',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}>
                  {searchResults.map((a) => (
                    <button
                      key={a.id}
                      onClick={() => {
                        setOneApplicant(a)
                        setOneModeSearch(a.name)
                        setShowResults(false)
                      }}
                      style={{
                        display: 'block', width: '100%', textAlign: 'left',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        color: '#e2e8f0', cursor: 'pointer',
                        fontFamily: 'Inter, sans-serif',
                        transition: 'background 0.1s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(102,126,234,0.1)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <div style={{ fontSize: '14px', fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: '12px', color: '#64748b' }}>{a.email}</div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Template */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <TemplateSelector templates={templates} onLoad={handleLoadTemplate} />
            </div>

            {/* Section: Compose */}
            <div className="glass-card" style={{ padding: '24px' }}>
              {/* Email type selector */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: '#94a3b8', marginBottom: '8px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  Email Type
                </label>
                <select
                  id="email-type"
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value as any)}
                  className="input-field"
                  style={{ width: 'auto' }}
                >
                  <option value="CONFIRMATION">✅ Confirmation</option>
                  <option value="SHORTLIST">⭐ Shortlist</option>
                  <option value="REJECTION">❌ Rejection</option>
                  <option value="CUSTOM">📝 Custom</option>
                </select>
              </div>

              <MessageComposer
                subject={subject}
                message={message}
                onSubjectChange={setSubject}
                onMessageChange={setMessage}
              />
            </div>

            {/* Send button */}
            <button
              id="send-email-btn"
              onClick={handleSend}
              disabled={sending || recipientCount === 0}
              className="btn-primary"
              style={{
                padding: '16px',
                fontSize: '16px',
                borderRadius: '14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
              }}
            >
              {sending ? (
                <>
                  <span style={{
                    width: '18px', height: '18px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                  }} />
                  Sending...
                </>
              ) : (
                `✉️ Send to ${mode === 'ONE' && oneApplicant ? oneApplicant.name : getRecipientLabel()}`
              )}
            </button>
          </div>

          {/* RIGHT — Preview */}
          <div style={{ position: 'sticky', top: '80px' }}>
            <EmailPreview
              name={previewName}
              email={previewEmail}
              subject={subject}
              message={message}
            />
          </div>
        </div>
      </main>

      <SendProgressModal
        isOpen={showProgress}
        isSending={sending}
        result={bulkResult}
        recipientLabel={getRecipientLabel()}
        emailsSentToday={stats.emailsSentToday}
        dailyLimit={stats.dailyLimit}
        onClose={() => { setShowProgress(false); setBulkResult(null) }}
      />

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 900px) {
          main > div:last-child { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  )
}

export default function EmailPage() {
  return (
    <Suspense>
      <EmailPageContent />
    </Suspense>
  )
}
