'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import RecipientSelector from '@/components/email/RecipientSelector'
import TemplateSelector from '@/components/email/TemplateSelector'
import MessageComposer from '@/components/email/MessageComposer'
import EmailPreview from '@/components/email/EmailPreview'
import SendProgressModal from '@/components/email/SendProgressModal'
import { Avatar } from '@/components/dashboard/ApplicantTable'
import StatusBadge from '@/components/dashboard/StatusBadge'
import { Mail, Gauge, Send, ArrowRight, LoaderCircle } from 'lucide-react'

type EmailType = 'CONFIRMATION' | 'REJECTION' | 'SHORTLIST' | 'CUSTOM'

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
  const [emailType, setEmailType] = useState<EmailType>('CONFIRMATION')
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
    setEmailType(template.template_type as EmailType)
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
          toast.success(`Email sent to ${oneApplicant.name}`)
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
      <main className="page">

        {/* Page header */}
        <div className="page-header fade-in">
          <div>
            <span className="eyebrow"><Mail size={13} /> Gmail outreach</span>
            <h1 className="page-title" style={{ marginTop: 12 }}>
              Compose a <span className="serif-italic text-gradient">message.</span>
            </h1>
            <p className="page-subtitle">Send personalised, branded emails to applicants straight from your Gmail.</p>
          </div>
          <span className="chip tabular" style={{ height: 34, padding: '0 14px' }}>
            <Gauge size={14} style={{ color: 'var(--accent)' }} />
            {Math.max(0, stats.dailyLimit - stats.emailsSentToday).toLocaleString()} sends left today
          </span>
        </div>

        {/* Two-column layout */}
        <div className="email-layout">

          {/* LEFT — Compose */}
          <div className="fade-in delay-1" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* Section: Send To */}
            <div className="surface" style={{ padding: 22 }}>
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
                  marginTop: 6,
                  background: 'var(--bg-modal)',
                  border: '1px solid var(--hairline-strong)',
                  borderRadius: 14,
                  overflow: 'hidden',
                  boxShadow: '0 20px 40px -16px rgba(0,0,0,0.7)',
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
                        display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left',
                        padding: '10px 14px',
                        background: 'transparent',
                        border: 'none',
                        borderBottom: '1px solid var(--hairline)',
                        color: 'var(--text)', cursor: 'pointer',
                        transition: 'background 0.12s',
                      }}
                      onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(139,123,255,0.08)')}
                      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                    >
                      <Avatar name={a.name} seed={a.email} size={32} />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--text-3)' }}>{a.email}</div>
                      </div>
                      <StatusBadge status={a.status} />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Section: Template */}
            <div className="surface" style={{ padding: 22 }}>
              <TemplateSelector templates={templates} onLoad={handleLoadTemplate} />
            </div>

            {/* Section: Compose */}
            <div className="surface" style={{ padding: 22 }}>
              <div className="section-head" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <span className="section-step">03</span>
                  <div>
                    <h3 className="section-title">Write your email</h3>
                    <p className="section-desc">Subject, message and email type.</p>
                  </div>
                </div>
                <select
                  id="email-type"
                  value={emailType}
                  onChange={(e) => setEmailType(e.target.value as EmailType)}
                  className="input-field"
                  style={{ width: 'auto', height: 36, fontSize: 13 }}
                  aria-label="Email type"
                >
                  <option value="CONFIRMATION">Confirmation</option>
                  <option value="SHORTLIST">Shortlist</option>
                  <option value="REJECTION">Rejection</option>
                  <option value="CUSTOM">Custom</option>
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
              className="btn-primary btn-lg btn-block"
              style={{ height: 56, fontSize: 15.5, borderRadius: 16 }}
            >
              {sending ? (
                <><LoaderCircle size={18} className="spin" /> Sending…</>
              ) : (
                <>
                  <Send size={17} />
                  Send to {mode === 'ONE' && oneApplicant ? oneApplicant.name : getRecipientLabel()}
                  <ArrowRight size={17} style={{ marginLeft: 'auto' }} />
                </>
              )}
            </button>
          </div>

          {/* RIGHT — Preview */}
          <div className="email-preview-col fade-in delay-2" style={{ position: 'sticky', top: 96 }}>
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
