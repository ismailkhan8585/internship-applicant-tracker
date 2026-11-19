'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { Paperclip, Inbox, ChevronLeft, ChevronRight, X, Save, StickyNote } from 'lucide-react'
import type { Applicant } from '@/lib/supabase'
import StatusBadge from './StatusBadge'
import QuickActions from './QuickActions'

interface TableData {
  applicants: Applicant[]
  total: number
  page: number
  pages: number
}

const AVATAR_HUES = ['139,123,255', '94,168,255', '61,220,151', '245,184,75', '208,140,255', '94,225,255', '255,107,122']

export function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return '?'
  return ((parts[0][0] || '') + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase()
}

export function avatarRgb(seed: string) {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0
  return AVATAR_HUES[h % AVATAR_HUES.length]
}

export function Avatar({ name, seed, size = 36 }: { name: string; seed: string; size?: number }) {
  const rgb = avatarRgb(seed)
  return (
    <span
      className="avatar"
      style={{
        width: size, height: size,
        background: `linear-gradient(140deg, rgba(${rgb},0.28), rgba(${rgb},0.08))`,
        border: `1px solid rgba(${rgb},0.3)`,
        color: `rgb(${rgb})`,
        fontSize: size * 0.36,
      }}
    >
      {initials(name)}
    </span>
  )
}

function NotesModal({
  applicant,
  onClose,
  onSave,
}: {
  applicant: Applicant | null
  onClose: () => void
  onSave: (id: string, notes: string) => void
}) {
  const [notes, setNotes] = useState(applicant?.notes || '')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    setNotes(applicant?.notes || '')
  }, [applicant])

  if (!applicant) return null

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/applicants/${applicant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes }),
      })
      if (res.ok) {
        onSave(applicant.id, notes)
        toast.success('Notes saved')
        onClose()
      } else {
        toast.error('Failed to save notes')
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Avatar name={applicant.name} seed={applicant.email} size={44} />
            <div style={{ minWidth: 0 }}>
              <h3 className="modal-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <StickyNote size={16} style={{ color: 'var(--amber)' }} /> Private notes
              </h3>
              <p className="modal-sub" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {applicant.name} · {applicant.email}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn" aria-label="Close"><X size={18} /></button>
        </div>
        <textarea
          className="input-field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Interview impressions, skills, follow-ups…"
          style={{ minHeight: '160px', marginBottom: '18px' }}
          autoFocus
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} className="btn btn-ghost">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary">
            <Save size={15} /> {saving ? 'Saving…' : 'Save notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const SKELETON_ROWS = 6
const COLS = ['#', 'Applicant', 'Applied', 'Status', 'Actions']

export default function ApplicantTable({
  status,
  search,
  sort,
  onViewCV,
  refreshKey,
}: {
  status: string
  search: string
  sort: string
  onViewCV: (a: Applicant) => void
  refreshKey: number
}) {
  const [data, setData] = useState<TableData>({ applicants: [], total: 0, page: 1, pages: 1 })
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const [notesApplicant, setNotesApplicant] = useState<Applicant | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const fetchData = useCallback(
    async (pg: number) => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          page: String(pg),
          limit: '50',
          ...(status && status !== 'ALL' ? { status } : {}),
          ...(search ? { search } : {}),
          sort,
        })
        const res = await fetch(`/api/applicants?${params}`)
        if (!res.ok) throw new Error('Failed')
        const json = await res.json()
        setData(json)
      } catch {
        toast.error('Failed to load applicants')
      } finally {
        setLoading(false)
      }
    },
    [status, search, sort]
  )

  useEffect(() => {
    setPage(1)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchData(1), 300)
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [status, search, sort, refreshKey])

  useEffect(() => {
    fetchData(page)
  }, [page]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleStatusChange = (id: string, newStatus: string) => {
    setData((prev) => ({
      ...prev,
      applicants: prev.applicants.map((a) =>
        a.id === id ? { ...a, status: newStatus as Applicant['status'] } : a
      ),
    }))
  }

  const handleNotesSave = (id: string, notes: string) => {
    setData((prev) => ({
      ...prev,
      applicants: prev.applicants.map((a) => (a.id === id ? { ...a, notes } : a)),
    }))
  }

  const startRow = data.total === 0 ? 0 : (page - 1) * 50 + 1
  const endRow = Math.min(page * 50, data.total)
  const pages = data.pages || 1

  return (
    <>
      <div className="surface" style={{ overflow: 'hidden' }}>
        {loading && (
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', overflow: 'hidden', zIndex: 2 }}>
            <div style={{
              width: '40%', height: '100%', background: 'var(--accent-grad)',
              animation: 'shimmer-bar 1.1s ease-in-out infinite',
            }} />
          </div>
        )}

        <div className="table-wrapper">
          <table className="data-table" style={{ minWidth: '640px' }}>
            <thead>
              <tr>
                {COLS.map((col, i) => (
                  <th key={col} style={i === 0 ? { width: 56 } : i === 4 ? { width: 1 } : undefined}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i} style={{ opacity: 1 - i * 0.13 }}>
                    <td><div className="skeleton" style={{ height: 12, width: 20 }} /></td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div className="skeleton" style={{ height: 36, width: 36, borderRadius: 11 }} />
                        <div style={{ display: 'grid', gap: 7 }}>
                          <div className="skeleton" style={{ height: 12, width: 140 }} />
                          <div className="skeleton" style={{ height: 10, width: 190 }} />
                        </div>
                      </div>
                    </td>
                    <td><div className="skeleton" style={{ height: 12, width: 70 }} /></td>
                    <td><div className="skeleton" style={{ height: 24, width: 96, borderRadius: 99 }} /></td>
                    <td><div className="skeleton" style={{ height: 30, width: 190, borderRadius: 9 }} /></td>
                  </tr>
                ))
              ) : data.applicants.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ textAlign: 'center', padding: '72px 20px' }}>
                    <span className="icon-tile" style={{
                      width: 56, height: 56, borderRadius: 18, marginBottom: 18,
                      background: 'var(--accent-soft)', border: '1px solid var(--accent-line)', color: 'var(--accent)',
                    }}>
                      <Inbox size={24} />
                    </span>
                    <div style={{ fontWeight: 700, color: 'var(--text)', marginBottom: 6, fontSize: 16 }}>
                      No applicants <span className="serif-italic" style={{ fontSize: '1.15em' }}>yet</span>
                    </div>
                    <div style={{ fontSize: 13, color: 'var(--text-3)' }}>
                      Sync your Gmail inbox, or loosen your search and filters.
                    </div>
                  </td>
                </tr>
              ) : (
                data.applicants.map((applicant, idx) => (
                  <tr key={applicant.id}>
                    <td>
                      <span className="tabular" style={{ color: 'var(--text-4)', fontSize: 12, fontWeight: 600 }}>
                        {String(startRow + idx).padStart(2, '0')}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                        <Avatar name={applicant.name} seed={applicant.email} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontWeight: 650, color: 'var(--text)', fontSize: 14, letterSpacing: '-0.01em' }}>
                            {applicant.name}
                          </div>
                          <div style={{ fontSize: 12.5, color: 'var(--text-3)', marginTop: 2 }}>
                            {applicant.email}
                          </div>
                          {applicant.cv_filename && (
                            <div style={{
                              display: 'inline-flex', alignItems: 'center', gap: 5, marginTop: 6,
                              fontSize: 11.5, color: 'var(--accent)', maxWidth: 260,
                            }}>
                              <Paperclip size={12} style={{ flexShrink: 0 }} />
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {applicant.cv_filename}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td style={{ whiteSpace: 'nowrap' }}>
                      <div style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 500 }}>
                        {format(new Date(applicant.date_applied), 'dd MMM yyyy')}
                      </div>
                      <div style={{ fontSize: 11.5, color: 'var(--text-4)', marginTop: 2 }}>
                        {format(new Date(applicant.date_applied), 'hh:mm a')}
                      </div>
                    </td>

                    <td><StatusBadge status={applicant.status} /></td>

                    <td>
                      <QuickActions
                        applicant={applicant}
                        onStatusChange={handleStatusChange}
                        onViewCV={onViewCV}
                        onNotes={(a) => setNotesApplicant(a)}
                      />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '14px 18px',
          borderTop: '1px solid var(--hairline)',
          background: 'rgba(255,255,255,0.012)',
          flexWrap: 'wrap', gap: 12,
        }}>
          <span className="tabular" style={{ fontSize: 13, color: 'var(--text-3)' }}>
            {data.total === 0 ? 'No results' : (
              <>Showing <strong style={{ color: 'var(--text)' }}>{startRow}–{endRow}</strong> of <strong style={{ color: 'var(--text)' }}>{data.total.toLocaleString()}</strong></>
            )}
          </span>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn btn-sm btn-secondary"
              aria-label="Previous page"
            >
              <ChevronLeft size={15} /> Prev
            </button>
            <span className="chip tabular" style={{ height: 34, padding: '0 12px' }}>
              {page} <span style={{ color: 'var(--text-4)' }}>/</span> {pages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              className="btn btn-sm btn-secondary"
              aria-label="Next page"
            >
              Next <ChevronRight size={15} />
            </button>
          </div>
        </div>
      </div>

      <style>{`@keyframes shimmer-bar { from { transform: translateX(-100%); } to { transform: translateX(250%); } }`}</style>

      <NotesModal
        applicant={notesApplicant}
        onClose={() => setNotesApplicant(null)}
        onSave={handleNotesSave}
      />
    </>
  )
}
