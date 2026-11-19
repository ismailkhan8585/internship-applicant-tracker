type Status = 'PENDING' | 'CONFIRMED' | 'SHORTLISTED' | 'REJECTED'

const BADGE_MAP: Record<Status, { label: string; cls: string }> = {
  PENDING: { label: 'Pending', cls: 'badge-pending' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed' },
  SHORTLISTED: { label: 'Shortlisted', cls: 'badge-shortlisted' },
  REJECTED: { label: 'Rejected', cls: 'badge-rejected' },
}

export default function StatusBadge({ status }: { status: string }) {
  const map = BADGE_MAP[status as Status] || { label: status, cls: 'badge-pending' }
  return (
    <span className={`badge ${map.cls}`}>
      <span className="badge-dot" />
      {map.label}
    </span>
  )
}
