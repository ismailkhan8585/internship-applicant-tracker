'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'
import type { Applicant } from '@/lib/supabase'
import StatusBadge from './StatusBadge'
import QuickActions from './QuickActions'
import { toast } from 'sonner'

interface TableData {
  applicants: Applicant[]
  total: number
  page: number
  pages: number
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
      <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', fontWeight: 700, color: '#e2e8f0' }}>
              📝 Notes — {applicant.name}
            </h3>
            <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748b' }}>{applicant.email}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: '8px', color: '#94a3b8', cursor: 'pointer', padding: '6px 10px',
              fontFamily: 'Inter, sans-serif', fontSize: '13px',
            }}
          >✕</button>
        </div>
        <textarea
          className="input-field"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add private notes about this applicant..."
          style={{ minHeight: '140px', marginBottom: '16px' }}
        />
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            style={{
              padding: '9px 18px', background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)', borderRadius: '10px',
              color: '#94a3b8', cursor: 'pointer', fontSize: '13px', fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="btn-primary"
            style={{ padding: '9px 18px', fontSize: '13px' }}
          >
            {saving ? 'Saving...' : '💾 Save Notes'}
          </button>
        </div>
      </div>
    </div>
  )
}

const SKELETON_ROWS = 5
const COLS = ['#', 'Name & Email', 'Date Applied', 'Status', 'Actions']

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

  return (
    <>
      <div
        style={{
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Loading bar */}
        {loading && (
          <div
            style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              height: '2px',
              background: 'linear-gradient(90deg, #667eea, #764ba2)',
              zIndex: 1,
            }}
          />
        )}

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ minWidth: '720px' }}>
            <thead>
              <tr>
                {COLS.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: SKELETON_ROWS }).map((_, i) => (
                  <tr key={i}>
                    {COLS.map((_, j) => (
                      <td key={j}>
                        <div
                          style={{
                            height: '14px',
                            borderRadius: '4px',
                            background: 'rgba(255,255,255,0.06)',
                            width: j === 0 ? '28px' : j === 1 ? '150px' : j === 2 ? '80px' : '90px',
                            opacity: 1 - i * 0.15,
                          }}
                        />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data.applicants.length === 0 ? (
                <tr>
                  <td colSpan={COLS.length} style={{ textAlign: 'center', padding: '56px 20px', color: '#475569' }}>
                    <div style={{ fontSize: '36px', marginBottom: '12px' }}>📭</div>
                    <div style={{ fontWeight: 600, color: '#64748b', marginBottom: '6px', fontSize: '15px' }}>
                      No applicants found
                    </div>
                    <div style={{ fontSize: '13px' }}>
                      Try syncing Gmail or adjusting your search / filters
                    </div>
                  </td>
                </tr>
              ) : (
                data.applicants.map((applicant, idx) => (
                  <tr key={applicant.id}>
                    {/* # */}
                    <td>
                      <span style={{ color: '#475569', fontSize: '12px', fontWeight: 600 }}>
                        {startRow + idx}
                      </span>
                    </td>

                    {/* Name + Email */}
                    <td>
                      <div style={{ fontWeight: 600, color: '#e2e8f0', fontSize: '14px' }}>
                        {applicant.name}
                      </div>
                      <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                        {applicant.email}
                      </div>
                      {applicant.cv_filename && (
                        <div style={{ fontSize: '11px', color: '#667eea', marginTop: '2px' }}>
                          📎 {applicant.cv_filename}
                        </div>
                      )}
                    </td>

                    {/* Date */}
                    <td>
                      <div style={{ fontSize: '13px', color: '#94a3b8' }}>
                        {format(new Date(applicant.date_applied), 'dd MMM')}
                      </div>
                      <div style={{ fontSize: '11px', color: '#475569' }}>
                        {format(new Date(applicant.date_applied), 'hh:mm a')}
                      </div>
                    </td>

                    {/* Status */}
                    <td>
                      <StatusBadge status={applicant.status} />
                    </td>

                    {/* Actions */}
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
        <div
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            flexWrap: 'wrap', gap: '12px',
          }}
        >
          <span style={{ fontSize: '13px', color: '#64748b' }}>
            {data.total === 0
              ? 'No results'
              : `Showing ${startRow}–${endRow} of ${data.total.toLocaleString()} applicants`}
          </span>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                background: page === 1 ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: page === 1 ? '#334155' : '#94a3b8',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              }}
            >
              ← Prev
            </button>
            <span style={{ fontSize: '13px', color: '#64748b', padding: '0 8px' }}>
              Page {page} / {data.pages || 1}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(data.pages, p + 1))}
              disabled={page >= data.pages}
              style={{
                padding: '6px 14px', borderRadius: '8px',
                background: page >= data.pages ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: page >= data.pages ? '#334155' : '#94a3b8',
                cursor: page >= data.pages ? 'not-allowed' : 'pointer',
                fontSize: '13px', fontWeight: 600, fontFamily: 'Inter, sans-serif',
              }}
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      <NotesModal
        applicant={notesApplicant}
        onClose={() => setNotesApplicant(null)}
        onSave={handleNotesSave}
      />
    </>
  )
}
