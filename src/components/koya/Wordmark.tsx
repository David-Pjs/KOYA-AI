export default function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Koya home"
      style={{
        background: 'none', border: 'none', padding: 0,
        cursor: onClick ? 'pointer' : 'default',
        display: 'inline-flex', alignItems: 'baseline', gap: 1,
      }}
    >
      <span className="font-display" style={{ fontSize: 24, fontWeight: 600, letterSpacing: '-0.03em', color: 'var(--ink)' }}>
        Koya
      </span>
      <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--terra)', marginLeft: 2, transform: 'translateY(-1px)' }} />
    </button>
  )
}
