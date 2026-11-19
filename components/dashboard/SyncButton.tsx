'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { RefreshCw } from 'lucide-react'

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
          toast.success(`Synced ${data.synced} applicants. ${data.remaining} more are waiting in the inbox — sync again to import them.`, {
            duration: 8000,
          })
        } else {
          toast.success(`Synced ${data.synced} new applicant${data.synced !== 1 ? 's' : ''}`)
        }
      } else {
        toast.info('Inbox is fully up to date')
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
    const diffMin = Math.floor((Date.now() - d.getTime()) / 60000)
    if (diffMin < 1) return 'Synced just now'
    if (diffMin < 60) return `Synced ${diffMin}m ago`
    const diffHr = Math.floor(diffMin / 60)
    if (diffHr < 24) return `Synced ${diffHr}h ago`
    return `Synced ${d.toLocaleDateString('en-PK', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}`
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
      <button id="sync-gmail-btn" onClick={handleSync} disabled={loading} className="btn-primary">
        <RefreshCw size={16} className={loading ? 'spin' : undefined} />
        {loading ? 'Syncing…' : 'Sync Gmail'}
      </button>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', fontSize: '12px', color: 'var(--text-3)' }}>
        <span className="pulse-dot" style={{ width: 7, height: 7, borderRadius: '50%', background: lastSynced ? 'var(--green)' : 'var(--text-4)' }} />
        {formatSyncTime(lastSynced)}
      </span>
    </div>
  )
}
