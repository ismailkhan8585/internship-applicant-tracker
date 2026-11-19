export default function LoadingSpinner({ size = 24, color = 'var(--accent)' }: { size?: number; color?: string }) {
  return (
    <span
      className="spin"
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: '2px solid rgba(255,255,255,0.1)',
        borderTopColor: color,
        borderRadius: '50%',
      }}
    />
  )
}
