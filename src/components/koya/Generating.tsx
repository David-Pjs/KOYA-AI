'use client'

import { useEffect, useState } from 'react'
import type { ClassSetup } from '@/lib/koya'

export default function Generating({ setup, readingScheme, mode = 'questions' }: { setup: ClassSetup; readingScheme: boolean; mode?: 'questions' | 'papers' }) {
  const steps = mode === 'papers'
    ? [
        'Reading the marked papers',
        'Following each student\'s working',
        'Noting where the answers go wrong',
        'Tracing what the mistakes share',
      ]
    : [
        readingScheme ? 'Matching your scheme of work' : `Opening the ${setup.klass} curriculum`,
        `Finding the skills ${setup.topic.toLowerCase()} leans on`,
        'Writing questions a copied answer cannot fake',
        'Putting five on the board',
      ]
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep(s => Math.min(s + 1, steps.length - 1)), 1100)
    return () => clearInterval(id)
  }, [steps.length])

  return (
    <div className="stage" style={{ background: 'var(--green-deep)', display: 'grid', placeItems: 'center' }}>
      <div style={{ maxWidth: 440, textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 36px', borderColor: 'oklch(70% 0.05 158 / 0.3)', borderTopColor: 'var(--paper)' }} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {steps.map((l, i) => {
            const active = i === step
            return (
              <p key={l} style={{
                margin: 0,
                fontSize: active ? '1.25rem' : '.95rem',
                fontFamily: active ? 'var(--font-display), serif' : 'inherit',
                fontWeight: active ? 600 : 400,
                letterSpacing: active ? '-0.02em' : 0,
                color: active ? 'var(--paper)' : i < step ? 'oklch(80% 0.04 158 / 0.55)' : 'oklch(80% 0.04 158 / 0.25)',
                transition: 'all .4s var(--ease)',
              }}>
                {l}
              </p>
            )
          })}
        </div>
      </div>
    </div>
  )
}
