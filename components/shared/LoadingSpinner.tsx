export default function LoadingSpinner({ size = 24, color = '#667eea' }: { size?: number; color?: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.15)`,
        borderTop: `2px solid ${color}`,
        borderRadius: '50%',
        animation: 'spin 0.75s linear infinite',
      }}
    />
  )
}
