export default function BrandMark({ size = 36 }: { size?: number }) {
  const radius = Math.round(size * 0.3)
  return (
    <span className="brand-mark" style={{ width: size, height: size, borderRadius: radius }}>
      <svg width={size * 0.56} height={size * 0.56} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 18V7.5c0-.8.9-1.2 1.5-.7L12 12l6.5-5.2c.6-.5 1.5-.1 1.5.7V18"
          stroke="#fff"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="18.2" r="1.6" fill="#fff" />
      </svg>
    </span>
  )
}
