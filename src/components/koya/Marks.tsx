'use client'

import { useState } from 'react'
import type { ClassSetup, Question } from '@/lib/koya'
import { severityOf } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  setup: ClassSetup
  questions: Question[]
  onBack: () => void
  onUsePhotos: () => void
  onSubmit: (wrongCounts: number[]) => void
}

const SEV = {
  crit: { color: 'var(--crit)', wash: 'var(--crit-wash)', label: 'most of the class' },
  concern: { color: 'var(--concern)', wash: 'var(--concern-wash)', label: 'a real chunk' },
  ok: { color: 'var(--ok)', wash: 'var(--ok-wash)', label: 'a handful' },
}

export default function Marks({ setup, questions, onBack, onUsePhotos, onSubmit }: Props) {
  const total = setup.studentCount
  const [counts, setCounts] = useState<string[]>(questions.map(() => ''))

  const parsed = counts.map(c => {
    const n = parseInt(c)
    return isNaN(n) ? 0 : Math.max(0, Math.min(n, total))
  })
  const filled = counts.filter(c => c.trim() !== '').length
  const allFilled = filled === questions.length
  const worst = Math.max(0, ...parsed)
  const readiness = total > 0 ? Math.round(((total - (parsed.reduce((a, b) => a + b, 0) / questions.length)) / total) * 100) : 100

  const set = (i: number, val: string) => {
    const next = [...counts]; next[i] = val; setCounts(next)
  }
  const bump = (i: number, d: number) => set(i, String(Math.max(0, Math.min(total, (parseInt(counts[i]) || 0) + d))))

  return (
    <div className="stage">
      <div className="col">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <Wordmark onClick={onBack} />
          <button className="btn-ghost" onClick={onBack}>← Questions</button>
        </header>

        <p className="label" style={{ color: 'var(--terra-deep)', marginBottom: 14 }}>Step three of three</p>
        <h1 className="display-l" style={{ marginBottom: 14 }}>How many got each one wrong?</h1>
        <p className="body-l" style={{ maxWidth: '44ch', marginBottom: 28 }}>
          Count the exercise books with a wrong answer. One number for each question. Koya
          watches the room take shape as you go.
        </p>

        {/* live readiness */}
        <div className="paper-card" style={{ padding: '16px 20px', marginBottom: 26 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
            <span className="label">Class readiness, so far</span>
            <span className="num" style={{ fontSize: 22, color: readinessColor(readiness) }}>
              {filled === 0 ? '—' : `${readiness}%`}
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--paper-sunk)', borderRadius: 99, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${filled === 0 ? 0 : readiness}%`, background: readinessColor(readiness), borderRadius: 99, transition: 'width .45s var(--ease), background .3s' }} />
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '.8rem', color: 'var(--ink-3)' }}>
            {total} students · {filled} of {questions.length} questions entered
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 30 }}>
          {questions.map((q, i) => {
            const has = counts[i].trim() !== ''
            const sev = SEV[severityOf(parsed[i], total)]
            const pct = total > 0 ? Math.round((parsed[i] / total) * 100) : 0
            return (
              <div
                key={i}
                className="paper-card"
                style={{ padding: '16px 18px', borderColor: has ? sev.color : 'var(--line)', transition: 'border-color .35s var(--ease)' }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                  <span className="disc" style={{ width: 30, height: 30, background: has ? sev.color : 'var(--green)', fontSize: '.85rem' }}>{i + 1}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: '0 0 12px', fontSize: '.92rem', color: 'var(--ink-2)', lineHeight: 1.45 }}>{q.question}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                      <CountInput value={counts[i]} sevColor={has ? sev.color : 'var(--line-strong)'} sevWash={has ? sev.wash : 'var(--paper-raised)'} onBump={d => bump(i, d)} onSet={v => set(i, v)} max={total} />
                      {has && (
                        <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.2 }}>
                          <span className="num" style={{ fontSize: 18, color: sev.color }}>{pct}% of the room</span>
                          <span style={{ fontSize: '.78rem', color: 'var(--ink-3)' }}>{sev.label}</span>
                        </span>
                      )}
                    </div>
                    {has && (
                      <div style={{ marginTop: 12, height: 4, background: 'var(--paper-sunk)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: sev.color, borderRadius: 99, transition: 'width .4s var(--ease)' }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <button className="btn btn-primary" disabled={!allFilled} onClick={() => onSubmit(parsed)} style={{ width: '100%' }}>
          {allFilled ? 'Read my class' : `Enter all ${questions.length} questions`}
        </button>
        {allFilled && worst >= total * 0.6 && (
          <p style={{ textAlign: 'center', marginTop: 14, fontSize: '.85rem', color: 'var(--ink-2)' }}>
            One question already stands out. Koya will find what connects them.
          </p>
        )}

        <button className="btn-ghost" onClick={onUsePhotos} style={{ display: 'block', margin: '18px auto 0' }}>
          Rather not count? Let Koya read the marked books
        </button>
      </div>
    </div>
  )
}

function CountInput({ value, sevColor, sevWash, onBump, onSet, max }: {
  value: string; sevColor: string; sevWash: string; onBump: (d: number) => void; onSet: (v: string) => void; max: number
}) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <RoundBtn label="−" onClick={() => onBump(-1)} />
      <input
        type="number" min={0} max={max} value={value} placeholder="0"
        onChange={e => onSet(e.target.value)}
        className="num"
        style={{
          width: 70, height: 50, textAlign: 'center', fontSize: 26,
          color: value ? sevColor : 'var(--ink)',
          background: sevWash,
          border: `2px solid ${value ? sevColor : 'var(--line-strong)'}`,
          borderRadius: 'var(--radius-sm)', outline: 'none',
          transition: 'all .35s var(--ease)',
        }}
      />
      <RoundBtn label="+" onClick={() => onBump(1)} />
    </div>
  )
}

function RoundBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label === '−' ? 'one fewer' : 'one more'}
      style={{
        width: 40, height: 40, flexShrink: 0, borderRadius: 9,
        border: '1.5px solid var(--line-strong)', background: 'var(--paper-raised)',
        color: 'var(--ink-2)', fontSize: 20, lineHeight: 1, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function readinessColor(r: number) {
  if (r >= 70) return 'var(--ok)'
  if (r >= 45) return 'var(--concern)'
  return 'var(--crit)'
}
