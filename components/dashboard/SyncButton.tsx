'use client'

import { useState } from 'react'
import { toast } from 'sonner'

export default function SyncButton({
  lastSynced,
  onSynced,
}: {
  lastSynced: string | null
  onSynced: (result: { synced: number; total: number }) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleSync = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/gmail/sync', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error || 'Sync failed')
        return
      }
      onSynced(data)
      if (data.synced > 0) {
        if (data.remaining && data.remaining > 0) {
          toast.success(`✅ Synced ${data.synced} applicants! (${data.remaining} more available in inbox — click Sync again to import more)`, {
            duration: 8000,
          })
        } else {
          toast.success(`✅ Synced ${data.synced} new applicant${data.synced !== 1 ? 's' : ''} found!`)
        }
      } else {
        toast.info('All inbox applicants are completely up to date!')
      }
    } catch {
      toast.error('Network error during sync')
    } finally {
      setLoading(false)
    }
  }

  const formatSyncTime = (iso: string | null) => {
    if (!iso) return 'Never synced'
    const d = new Date(iso)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffMin = Math.floor(diffMs / 60000)
    if (diffMin < 1) return 'Just now'
    if (diffMin < 60) return `${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `${diffHr}h ago`
    return d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      <button
        id="sync-gmail-btn"
        onClick={handleSync}
        disabled={loading}
        className="btn-primary"
        style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '9px 18px', fontSize: '14px',
        }}
      >
        <span
          style={{
            display: 'inline-block',
            animation: loading ? 'spin 0.8s linear infinite' : 'none',
          }}
        >
          🔄
        </span>
        {loading ? 'Syncing...' : 'Sync Gmail'}
      </button>
      <span style={{ fontSize: '12px', color: '#475569' }}>
        Last: {formatSyncTime(lastSynced)}
      </span>
    </div>
  )
}
