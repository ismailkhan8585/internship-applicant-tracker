type Status = 'PENDING' | 'CONFIRMED' | 'SHORTLISTED' | 'REJECTED'

const BADGE_MAP: Record<Status, { label: string; cls: string; icon: string }> = {
  PENDING: { label: 'Pending', cls: 'badge-pending', icon: '⏳' },
  CONFIRMED: { label: 'Confirmed', cls: 'badge-confirmed', icon: '✅' },
  SHORTLISTED: { label: 'Shortlisted', cls: 'badge-shortlisted', icon: '⭐' },
  REJECTED: { label: 'Rejected', cls: 'badge-rejected', icon: '❌' },
}

export default function StatusBadge({ status }: { status: string }) {
  const map = BADGE_MAP[status as Status] || { label: status, cls: 'badge-pending', icon: '❓' }
  return (
    <span className={map.cls}>
      {map.icon} {map.label}
    </span>
  )
}
