'use client'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmColor?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  confirmColor = '#667eea',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div
        className="modal-content"
        style={{ maxWidth: '420px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ margin: '0 0 12px', fontSize: '18px', fontWeight: 700, color: '#e2e8f0' }}>
          {title}
        </h3>
        <p style={{ margin: '0 0 28px', fontSize: '14px', color: '#94a3b8', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            style={{
              padding: '10px 20px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px',
              color: '#94a3b8',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding: '10px 20px',
              background: confirmColor,
              border: 'none',
              borderRadius: '10px',
              color: 'white',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: 600,
              fontFamily: 'Inter, sans-serif',
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
