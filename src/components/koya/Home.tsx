'use client'

import MarkedWorking from './MarkedWorking'
import Wordmark from './Wordmark'

export default function Home({ onStart }: { onStart: () => void }) {
  return (
    <div style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      <header
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '22px clamp(20px, 5vw, 48px)',
        }}
      >
        <Wordmark />
        <span className="label" style={{ color: 'var(--ink-3)' }}>
          Maths &amp; Science · Secondary
        </span>
      </header>

      <main
        style={{
          flex: 1,
          display: 'grid',
          alignItems: 'center',
          gap: 'clamp(2rem, 5vw, 5rem)',
          padding: '0 clamp(20px, 5vw, 48px) clamp(40px, 6vw, 72px)',
          maxWidth: 1180,
          margin: '0 auto',
          width: '100%',
        }}
        className="home-grid"
      >
        <section style={{ maxWidth: 600 }}>
          <p className="label rise" style={{ animationDelay: '.05s', marginBottom: 22, color: 'var(--terra-deep)' }}>
            A diagnostic instrument for the 60-student classroom
          </p>

          <h1 className="display-xl rise" style={{ animationDelay: '.12s' }}>
            Find the{' '}
            <span style={{ position: 'relative', whiteSpace: 'nowrap' }}>
              gap
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute', left: '-2%', right: '-2%', bottom: '0.06em', height: '0.16em',
                  background: 'var(--terra)', borderRadius: 99,
                  clipPath: 'inset(0 100% 0 0)',
                  animation: 'inkUnderline .6s var(--ease) .7s forwards',
                }}
              />
            </span>{' '}
            before the exam does.
          </h1>

          <p className="body-l rise" style={{ animationDelay: '.22s', marginTop: 26, maxWidth: '46ch' }}>
            A class of sixty can share one hidden gap from two years ago. Koya finds it
            from the papers you already mark, then tells you who is lost, why, and what to
            do tomorrow morning.
          </p>

          <div
            className="rise"
            style={{ animationDelay: '.32s', marginTop: 38, display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'flex-start' }}
          >
            <button className="btn btn-primary" onClick={onStart} style={{ fontSize: '1.05rem', padding: '1.1rem 1.9rem' }}>
              Start a diagnostic
            </button>
            <span style={{ fontSize: '.85rem', color: 'var(--ink-3)' }}>
              One lesson. Pen and paper. No student phones, no internet in the room.
            </span>
          </div>
        </section>

        <aside
          className="rise home-aside"
          style={{ animationDelay: '.4s', justifySelf: 'center', maxWidth: 360, width: '100%' }}
        >
          <MarkedWorking />
          <p style={{ marginTop: 26, fontSize: '.9rem', color: 'var(--ink-2)', lineHeight: 1.6, maxWidth: '34ch' }}>
            The working looks like SS2 algebra. The real mistake is a JSS2 one: he cannot
            subtract a negative. Thirty others in the room made the same one.
          </p>
        </aside>
      </main>
    </div>
  )
}
