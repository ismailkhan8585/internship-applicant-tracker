'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import Navbar from '@/components/shared/Navbar'
import StatsCards from '@/components/dashboard/StatsCards'
import DailyLimitBar from '@/components/dashboard/DailyLimitBar'
import SyncButton from '@/components/dashboard/SyncButton'
import ApplicantTable from '@/components/dashboard/ApplicantTable'
import CVModal from '@/components/dashboard/CVModal'
import type { Applicant, EmailTemplate } from '@/lib/supabase'
import { Search, FileSpreadsheet, Zap, Star, Send, LoaderCircle } from 'lucide-react'

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

function DashboardContent() {
  const searchParams = useSearchParams()
  const [stats, setStats] = useState<Stats>({
    total: 0, pending: 0, confirmed: 0, shortlisted: 0, rejected: 0,
    emailsSentToday: 0, dailyLimit: 500, lastGmailSync: null,
  })
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('ALL')
  const [sort, setSort] = useState('newest')
  const [refreshKey, setRefreshKey] = useState(0)
  const [cvApplicant, setCVApplicant] = useState<Applicant | null>(null)
  const [bulkSending, setBulkSending] = useState(false)
  const [bulkTarget, setBulkTarget] = useState<'PENDING' | 'SHORTLISTED' | null>(null)

  const [greeting, setGreeting] = useState('Welcome back')
  const [today, setToday] = useState('Internship Console')

  useEffect(() => {
    const now = new Date()
    const hour = now.getHours()
    setGreeting(hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening')
    setToday(now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' }))
  }, [])

  const fetchStats = useCallback(async () => {
    const res = await fetch('/api/applicants/stats')
    if (res.ok) {
      const data = await res.json()
      setStats(data)
    }
  }, [])

  useEffect(() => {
    fetchStats()
    // Handle OAuth redirects
    const gmailConnected = searchParams.get('gmail_connected')
    const gmailError = searchParams.get('gmail_error')
    if (gmailConnected) toast.success('Gmail connected successfully')
    if (gmailError) toast.error(`Gmail error: ${gmailError}`)
  }, [])

  const handleSynced = () => {
    fetchStats()
    setRefreshKey((k) => k + 1)
  }

  const handleExport = async () => {
    const params = status !== 'ALL' ? `?status=${status}` : ''
    const res = await fetch(`/api/export${params}`)
    if (!res.ok) { toast.error('Export failed'); return }
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `mentortechz-applicants-${new Date().toISOString().slice(0, 10)}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
    toast.success('Excel file downloaded')
  }

  const handleBulkSend = async (targetStatus: 'PENDING' | 'SHORTLISTED') => {
    setBulkTarget(targetStatus)
    setBulkSending(true)

    try {
      // Get default template
      const tplRes = await fetch('/api/templates')
      const tplData = await tplRes.json()
      const templates: EmailTemplate[] = tplData.templates || []
      const emailType = targetStatus === 'PENDING' ? 'CONFIRMATION' : 'SHORTLIST'
      const template = templates.find((t) => t.template_type === emailType && t.is_default)
        || templates.find((t) => t.template_type === emailType)

      if (!template) {
        toast.error('No default template found. Go to Email page to configure templates.')
        return
      }

      toast.info(`Sending to all ${targetStatus.toLowerCase()} applicants... This may take a while.`)

      const res = await fetch('/api/gmail/send-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: targetStatus,
          subject: template.subject,
          message: template.message,
          emailType,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        toast.error(data.error || 'Bulk send failed')
        return
      }

      if (data.rateLimited) {
        toast.warning(`⏳ Google rate limit reached after sending ${data.sent} emails. Please wait 15-20 minutes before resuming.`, {
          duration: 8000,
        })
      } else {
        toast.success(`✅ Done! Sent: ${data.sent}, Skipped: ${data.skipped}, Failed: ${data.failed}`)
      }
      fetchStats()
      setRefreshKey((k) => k + 1)
    } catch {
      toast.error('Network error during bulk send')
    } finally {
      setBulkSending(false)
      setBulkTarget(null)
    }
  }

  return (
    <>
      <Navbar />
      <main className="page">

        {/* Page header */}
        <div className="page-header fade-in">
          <div>
            <span className="eyebrow">
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
              {today}
            </span>
            <h1 className="page-title" style={{ marginTop: 12 }}>
              {greeting}, <span className="serif-italic text-gradient">Admin.</span>
            </h1>
            <p className="page-subtitle">
              Software Development Internship 2025 — here&apos;s how your applicant pipeline looks today.
            </p>
          </div>
          <button id="export-btn" onClick={handleExport} className="btn btn-secondary">
            <FileSpreadsheet size={16} style={{ color: 'var(--green)' }} /> Export to Excel
          </button>
        </div>

        {/* Stats cards */}
        <div style={{ marginBottom: 14 }}>
          <StatsCards stats={stats} />
        </div>

        {/* Daily limit */}
        <div className="fade-in delay-4" style={{ marginBottom: 32 }}>
          <DailyLimitBar sent={stats.emailsSentToday} limit={stats.dailyLimit} />
        </div>

        {/* Section heading */}
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 14, flexWrap: 'wrap' }}>
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700, letterSpacing: '-0.025em' }}>
            Applicants
          </h2>
          <span style={{ fontSize: 12.5, color: 'var(--text-3)' }}>Manage, review and reach out</span>
        </div>

        {/* Controls bar */}
        <div className="controls-row" style={{ marginBottom: 12 }}>
          <SyncButton lastSynced={stats.lastGmailSync} onSynced={handleSynced} />

          <div style={{ flex: 1 }} />

          <div className="input-icon-wrap" style={{ width: 300 }}>
            <Search size={16} />
            <input
              id="search-input"
              type="text"
              placeholder="Search name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
            />
          </div>

          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="ALL">All statuses</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="SHORTLISTED">Shortlisted</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: 150 }}
          >
            <option value="newest">Newest first</option>
            <option value="oldest">Oldest first</option>
            <option value="name">Name A–Z</option>
          </select>
        </div>

        {/* Bulk action bar */}
        <div className="bulk-actions surface" style={{
          display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 12,
          padding: '12px 14px 12px 18px', borderRadius: 16, alignItems: 'center',
          background: 'linear-gradient(90deg, rgba(139,123,255,0.08), rgba(255,255,255,0.015) 60%)',
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-2)', fontWeight: 600, marginRight: 'auto' }}>
            <Zap size={15} style={{ color: 'var(--accent)' }} /> Bulk outreach
            <span style={{ color: 'var(--text-3)', fontWeight: 500 }}>· uses your default templates</span>
          </span>

          <button
            id="bulk-shortlisted-btn"
            onClick={() => handleBulkSend('SHORTLISTED')}
            disabled={bulkSending}
            className="btn btn-tint tint-blue"
          >
            {bulkSending && bulkTarget === 'SHORTLISTED'
              ? <><LoaderCircle size={15} className="spin" /> Sending…</>
              : <><Star size={15} /> Email shortlisted <span className="tabular" style={{ opacity: 0.7 }}>{stats.shortlisted}</span></>}
          </button>

          <button
            id="bulk-pending-btn"
            onClick={() => handleBulkSend('PENDING')}
            disabled={bulkSending}
            className="btn-primary"
          >
            {bulkSending && bulkTarget === 'PENDING'
              ? <><LoaderCircle size={15} className="spin" /> Sending…</>
              : <><Send size={15} /> Confirm all pending <span className="tabular" style={{ opacity: 0.75 }}>{stats.pending}</span></>}
          </button>
        </div>

        {/* Table */}
        <div className="fade-in" style={{ position: 'relative' }}>
          <ApplicantTable
            status={status}
            search={search}
            sort={sort}
            onViewCV={setCVApplicant}
            refreshKey={refreshKey}
          />
        </div>
      </main>

      <CVModal applicant={cvApplicant} onClose={() => setCVApplicant(null)} />
    </>
  )
}

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  )
}
