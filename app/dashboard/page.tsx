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
import type { Applicant } from '@/lib/supabase'

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
    if (gmailConnected) toast.success('✅ Gmail connected successfully!')
    if (gmailError) toast.error(`Gmail error: ${gmailError}`)
  }, [])

  const handleSynced = (result: { synced: number; total: number }) => {
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
    toast.success('📊 Excel file downloaded!')
  }

  const handleBulkSend = async (targetStatus: 'PENDING' | 'SHORTLISTED') => {
    setBulkTarget(targetStatus)
    setBulkSending(true)

    try {
      // Get default template
      const tplRes = await fetch('/api/templates')
      const tplData = await tplRes.json()
      const templates = tplData.templates || []
      const emailType = targetStatus === 'PENDING' ? 'CONFIRMATION' : 'SHORTLIST'
      const template = templates.find((t: any) => t.template_type === emailType && t.is_default)
        || templates.find((t: any) => t.template_type === emailType)

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
      <main style={{ maxWidth: '1400px', margin: '0 auto', padding: '24px 20px' }}>

        {/* Page header */}
        <div className="page-header" style={{ marginBottom: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800, color: '#e2e8f0', letterSpacing: '-0.5px' }}>
              📊 Applicant Dashboard
            </h1>
            <p style={{ margin: '4px 0 0', fontSize: '13px', color: '#64748b' }}>
              MentorTechz Software Development Internship 2025
            </p>
          </div>
          <a
            href="https://chat.whatsapp.com/HJzrefbXOVn3sAmfIsNhJp"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 16px',
              background: 'rgba(37, 211, 102, 0.12)',
              border: '1px solid rgba(37, 211, 102, 0.3)',
              borderRadius: '10px',
              color: '#25D366',
              fontSize: '13px',
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s',
            }}
          >
            <span>📱</span> Join WhatsApp Group
          </a>
        </div>

        {/* Stats cards */}
        <div style={{ marginBottom: '16px' }}>
          <StatsCards stats={stats} />
        </div>

        {/* Daily limit */}
        <div style={{ marginBottom: '20px' }}>
          <DailyLimitBar sent={stats.emailsSentToday} limit={stats.dailyLimit} />
        </div>

        {/* Controls bar */}
        <div className="controls-row" style={{ marginBottom: '16px' }}>
          <SyncButton lastSynced={stats.lastGmailSync} onSynced={handleSynced} />

          {/* Search */}
          <div style={{ flex: 1, minWidth: '200px', maxWidth: '320px', position: 'relative' }}>
            <span style={{
              position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
              fontSize: '14px', pointerEvents: 'none',
            }}>🔍</span>
            <input
              id="search-input"
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Status filter */}
          <select
            id="status-filter"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '140px' }}
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">⏳ Pending</option>
            <option value="CONFIRMED">✅ Confirmed</option>
            <option value="SHORTLISTED">⭐ Shortlisted</option>
            <option value="REJECTED">❌ Rejected</option>
          </select>

          {/* Sort */}
          <select
            id="sort-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input-field"
            style={{ width: 'auto', minWidth: '160px' }}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="name">Name A–Z</option>
          </select>

          {/* Export */}
          <button
            id="export-btn"
            onClick={handleExport}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '9px 16px', borderRadius: '10px',
              background: 'rgba(34,197,94,0.12)',
              border: '1px solid rgba(34,197,94,0.25)',
              color: '#86efac',
              cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            📊 Export Excel
          </button>
        </div>

        {/* Bulk action bar */}
        <div className="bulk-actions" style={{
          display: 'flex', gap: '12px', flexWrap: 'wrap', marginBottom: '16px',
          padding: '14px 18px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: '12px',
          alignItems: 'center',
        }}>
          <span style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>Bulk Actions:</span>

          <button
            id="bulk-pending-btn"
            onClick={() => handleBulkSend('PENDING')}
            disabled={bulkSending}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            {bulkSending && bulkTarget === 'PENDING' ? '⏳ Sending...' : `✉️ Send to All Pending (${stats.pending})`}
          </button>

          <button
            id="bulk-shortlisted-btn"
            onClick={() => handleBulkSend('SHORTLISTED')}
            disabled={bulkSending}
            style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              padding: '8px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600,
              background: bulkSending && bulkTarget === 'SHORTLISTED' ? 'rgba(59,130,246,0.3)' : 'rgba(59,130,246,0.15)',
              border: '1px solid rgba(59,130,246,0.3)',
              color: '#93c5fd', cursor: bulkSending ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {bulkSending && bulkTarget === 'SHORTLISTED' ? '⏳ Sending...' : `⭐ Send Shortlist Emails (${stats.shortlisted})`}
          </button>
        </div>

        {/* Table */}
        <div style={{ position: 'relative' }}>
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
