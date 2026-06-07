// A student's exercise-book working with a dropped-negative-sign error,
// circled in the teacher's terracotta pen. This is the whole product in one image:
// the surface answer looks like algebra, the real gap is JSS2 integers.

export default function MarkedWorking({ className = '' }: { className?: string }) {
  return (
    <figure
      className={className}
      style={{
        margin: 0,
        background: 'var(--paper-raised)',
        border: '1.5px solid var(--line)',
        borderRadius: 4,
        padding: '26px 26px 30px',
        boxShadow: '0 1px 0 var(--line), 0 18px 40px -28px oklch(24% 0.012 70 / 0.45)',
        transform: 'rotate(-2.2deg)',
        position: 'relative',
        // faint ruled lines like an exercise book
        backgroundImage:
          'repeating-linear-gradient(to bottom, transparent, transparent 33px, var(--line) 33px, var(--line) 34px)',
        backgroundPosition: '0 18px',
      }}
      aria-label="A student's working: x minus 4 equals negative 7, answer written as positive 3, circled by the teacher because it should be negative 3."
    >
      <figcaption className="label" style={{ position: 'relative', marginBottom: 18, color: 'var(--ink-3)' }}>
        Chidi · Question 3
      </figcaption>

      <div
        className="font-hand"
        style={{ fontSize: 30, color: 'var(--ink)', lineHeight: 1.45, letterSpacing: '0.01em' }}
      >
        <div>x − 4 = −7</div>
        <div>x = −7 + 4</div>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          x = 3
          {/* hand-drawn circle around the wrong answer */}
          <svg
            width="92" height="70" viewBox="0 0 92 70"
            style={{ position: 'absolute', left: -16, top: -16, overflow: 'visible' }}
            aria-hidden="true"
          >
            <path
              d="M58 10 C70 14 78 26 74 40 C70 56 48 62 30 58 C12 54 6 40 12 26 C18 12 40 6 58 10 C60 10.5 62 11 63 12"
              fill="none"
              stroke="var(--terra)"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* teacher's margin correction */}
      <div
        className="font-hand"
        style={{
          position: 'absolute',
          right: 14,
          bottom: 16,
          color: 'var(--terra-deep)',
          fontSize: 26,
          transform: 'rotate(-6deg)',
          textAlign: 'right',
          lineHeight: 1.1,
        }}
      >
        −3.
        <div style={{ fontSize: 19 }}>mind the sign</div>
      </div>
    </figure>
  )
}
