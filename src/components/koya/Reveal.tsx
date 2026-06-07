'use client'

import { useEffect, useRef, useState } from 'react'
import type { ClassSetup, Diagnosis, Question } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  setup: ClassSetup
  questions: Question[]
  wrongCounts: number[]
  diagnosis: Diagnosis | null
  error: string | null
  onReset: () => void
  onRetry: () => void
}

const READ_MIN_MS = 2600

export default function Reveal({ setup, questions, wrongCounts, diagnosis, error, onReset, onRetry }: Props) {
  const [revealed, setRevealed] = useState(false)
  const startedAt = useRef(Date.now())

  useEffect(() => {
    if (!diagnosis) return
    const wait = Math.max(0, READ_MIN_MS - (Date.now() - startedAt.current))
    const t = setTimeout(() => setRevealed(true), wait)
    return () => clearTimeout(t)
  }, [diagnosis])

  if (error) return <RevealError error={error} onRetry={onRetry} onReset={onReset} />
  if (!revealed || !diagnosis) return <Reading setup={setup} questions={questions} wrongCounts={wrongCounts} />

  return <Diagnosed setup={setup} d={diagnosis} onReset={onReset} />
}

/* ── reading beat ───────────────────────────────────────── */

function Reading({ setup, questions, wrongCounts }: { setup: ClassSetup; questions: Question[]; wrongCounts: number[] }) {
  const [step, setStep] = useState(0)
  const total = setup.studentCount

  // Real lines built from the actual marks entered — not scripted filler.
  // Worst-failed skill first, so the eye follows the real signal.
  const rows = questions
    .map((q, i) => ({ skill: q.skill_tested, wrong: wrongCounts[i] ?? 0 }))
    .sort((a, b) => b.wrong - a.wrong)
    .map(r => ({
      text: `${r.skill} — ${r.wrong} of ${total} missed it`,
      heavy: r.wrong >= total * 0.5,
    }))

  const all = [
    ...rows,
    { text: `Lining up all ${questions.length} skills`, heavy: false },
    { text: 'Tracing what the mistakes have in common', heavy: false },
  ]

  useEffect(() => {
    const id = setInterval(() => setStep(s => s + 1), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="stage" style={{ background: 'var(--green-deep)', display: 'grid', placeItems: 'center' }}>
      <div style={{ maxWidth: 520, textAlign: 'center', width: '100%' }}>
        <div className="spinner" style={{ margin: '0 auto 36px', borderColor: 'oklch(70% 0.05 158 / 0.3)', borderTopColor: 'var(--paper)' }} />
        <p className="label" style={{ marginBottom: 20, color: 'oklch(80% 0.04 158 / 0.55)' }}>Reading the marks you entered</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 11 }}>
          {all.map((l, i) => {
            const active = i === Math.min(step, all.length - 1)
            const done = i < Math.min(step, all.length - 1)
            return (
              <p key={l.text} style={{
                margin: 0,
                fontSize: active ? '1.2rem' : '.95rem',
                fontFamily: active ? 'var(--font-display), serif' : 'inherit',
                fontWeight: active ? 600 : 400,
                letterSpacing: active ? '-0.02em' : 0,
                color: active
                  ? (l.heavy ? 'oklch(80% 0.12 40)' : 'var(--paper)')
                  : done ? 'oklch(80% 0.04 158 / 0.55)' : 'oklch(80% 0.04 158 / 0.22)',
                transition: 'all .4s var(--ease)',
              }}>
                {l.text}
              </p>
            )
          })}
        </div>
        <p className="label" style={{ marginTop: 40, color: 'oklch(80% 0.04 158 / 0.45)' }}>{setup.subject} · {setup.topic} · {total} students</p>
      </div>
    </div>
  )
}

/* ── the diagnosis ──────────────────────────────────────── */

function Diagnosed({ setup, d, onReset }: { setup: ClassSetup; d: Diagnosis; onReset: () => void }) {
  const groups = [
    { key: 'foundation', name: 'Foundation', sev: 'crit', g: d.groups.foundation },
    { key: 'core', name: 'Core', sev: 'concern', g: d.groups.core },
    { key: 'advanced', name: 'Advanced', sev: 'ok', g: d.groups.advanced },
  ] as const

  const total = setup.studentCount
  const affected = d.dominant_gap.affected_count
  // scale described in words, not a shouting digit, and aware of one-student reads
  const share = total === 1
    ? 'This student'
    : affected >= total * 0.66 ? 'Most of the class' : affected >= total * 0.4 ? 'A large part of the class' : affected >= total * 0.2 ? 'A cluster of students' : 'A few students'

  return (
    <div className="stage">
      <div className="col">
        <header className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(2rem, 5vw, 3rem)' }}>
          <Wordmark onClick={onReset} />
          <span className="label" style={{ color: 'var(--ink-3)' }}>{setup.klass} · {setup.topic}</span>
        </header>

        {/* the insight, as the star — not a number */}
        <p className="label rise" style={{ color: 'var(--terra-deep)', marginBottom: 18 }}>What your class is really stuck on</p>
        <h1 className="display-l rise" style={{ animationDelay: '.05s', marginBottom: 20, maxWidth: '20ch' }}>
          {d.headline}
        </h1>

        {/* root gap — writes in */}
        <div className="paper-card rise" style={{ animationDelay: '.16s', padding: '22px 24px', marginBottom: 16, borderColor: 'var(--green-line)', background: 'var(--green-wash)' }}>
          <p className="label" style={{ color: 'var(--green-ink)', marginBottom: 10 }}>Where they fell behind</p>
          <Typewriter text={d.dominant_gap.explanation} />
          <p style={{ margin: '14px 0 0', fontSize: '.95rem', lineHeight: 1.5 }}>
            <span style={{ color: 'var(--ink-2)' }}>{share} never secured </span>
            <span className="font-hand" style={{ fontSize: '1.3rem', color: 'var(--terra-deep)' }}>{d.dominant_gap.root_topic}</span>
          </p>
        </div>

        {/* evidence — Koya shows its reasoning */}
        {d.evidence && (
          <div className="rise" style={{ animationDelay: '.22s', display: 'flex', gap: 14, alignItems: 'flex-start', padding: '4px 4px 0' }}>
            <span className="label" style={{ color: 'var(--ink-3)', marginTop: 4, flexShrink: 0 }}>How Koya<br />knows</span>
            <p style={{ margin: 0, fontSize: '.95rem', lineHeight: 1.6, color: 'var(--ink-2)' }}>{d.evidence}</p>
          </div>
        )}

        {/* how to close it — groups, led by what each needs */}
        <p className="label rise" style={{ animationDelay: '.28s', margin: '34px 0 14px' }}>How to close it tomorrow</p>
        <div className="groups rise" style={{ animationDelay: '.32s' }}>
          {groups.map((grp, i) => (
            <GroupCard key={grp.key} name={grp.name} sev={grp.sev} group={grp.g} total={total} delay={0.34 + i * 0.06} />
          ))}
        </div>

        {/* tomorrow */}
        <div className="rise" style={{ animationDelay: '.5s', marginTop: 30, padding: '4px 0', display: 'flex', gap: 16, alignItems: 'flex-start' }}>
          <span className="label" style={{ color: 'var(--terra-deep)', marginTop: 8, flexShrink: 0 }}>Your first move</span>
          <p className="font-hand" style={{ fontSize: '1.65rem', color: 'var(--ink)', lineHeight: 1.35, margin: 0 }}>
            {d.tomorrow}
          </p>
        </div>

        <div className="no-print" style={{ display: 'flex', gap: 12, marginTop: 38, flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => window.print()} style={{ flex: 1, minWidth: 180 }}>Print the plan</button>
          <button className="btn btn-quiet" onClick={onReset} style={{ flex: 1, minWidth: 180 }}>Run another diagnostic</button>
        </div>
      </div>
    </div>
  )
}

function GroupCard({ name, sev, group, total, delay }: { name: string; sev: 'crit' | 'concern' | 'ok'; group: Diagnosis['groups']['foundation']; total: number; delay: number }) {
  const [open, setOpen] = useState(false)
  const color = `var(--${sev})`
  const wash = `var(--${sev}-wash)`
  const empty = group.count === 0
  const countLabel = total === 1 ? '' : `${group.count} of ${total}`

  if (empty) {
    return (
      <div className="paper-card rise" style={{ animationDelay: `${delay}s`, overflow: 'hidden', opacity: 0.55 }}>
        <div style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--ink-3)', flexShrink: 0 }} />
            <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink-2)' }}>{name}</span>
            <span style={{ marginLeft: 'auto', fontSize: '.74rem', color: 'var(--ink-3)', fontWeight: 600 }}>none</span>
          </div>
          <p style={{ margin: '8px 0 0', fontSize: '.82rem', color: 'var(--ink-3)', lineHeight: 1.5 }}>No one landed here this time.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="paper-card rise" style={{ animationDelay: `${delay}s`, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '16px 18px', background: wash, borderBottom: `1.5px solid ${color}` }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0 }} />
          <span className="font-display" style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--ink)' }}>{name}</span>
          {countLabel && <span style={{ marginLeft: 'auto', fontSize: '.74rem', color: 'var(--ink-3)', fontWeight: 600 }}>{countLabel}</span>}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: '.85rem', color: 'var(--ink)', lineHeight: 1.5 }}>{group.description}</p>
      </div>
      <button
        onClick={() => setOpen(o => !o)}
        className="no-print"
        style={{ background: 'none', border: 'none', padding: '12px 18px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', textAlign: 'left' }}
      >
        <span style={{ fontSize: '.86rem', fontWeight: 700, color: 'var(--ink)' }}>{group.activity.title}</span>
        <span style={{ fontSize: '.75rem', color: 'var(--ink-3)' }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ padding: '0 18px 16px' }}>
          <span className="chip chip-green" style={{ marginBottom: 8 }}>{group.activity.duration} · paper only</span>
          <p style={{ margin: '8px 0 0', fontSize: '.86rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>{group.activity.instructions}</p>
          {group.activity.runs && (
            <p style={{ margin: '10px 0 0', fontSize: '.8rem', color: 'var(--ink-3)', fontStyle: 'italic', lineHeight: 1.5 }}>
              ↳ {group.activity.runs}
            </p>
          )}
        </div>
      )}
      {/* print: always show activity */}
      <div className="print-only" style={{ padding: '0 18px 16px' }}>
        <p style={{ margin: '8px 0 0', fontSize: '.86rem', color: 'var(--ink-2)', lineHeight: 1.65 }}>
          <strong>{group.activity.title}</strong> ({group.activity.duration}). {group.activity.instructions}
        </p>
      </div>
    </div>
  )
}

/* ── typewriter ─────────────────────────────────────────── */

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState('')
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) { setShown(text); return }
    let i = 0
    const id = setInterval(() => {
      i += 2
      setShown(text.slice(0, i))
      if (i >= text.length) clearInterval(id)
    }, 16)
    return () => clearInterval(id)
  }, [text])
  return (
    <p style={{ margin: 0, fontSize: '1.05rem', lineHeight: 1.65, color: 'var(--ink)', minHeight: '1.65em' }}>
      {shown}
    </p>
  )
}

/* ── error ──────────────────────────────────────────────── */

function RevealError({ error, onRetry, onReset }: { error: string; onRetry: () => void; onReset: () => void }) {
  return (
    <div className="stage" style={{ display: 'grid', placeItems: 'center' }}>
      <div className="col" style={{ textAlign: 'center', maxWidth: 440 }}>
        <h1 className="title" style={{ marginBottom: 12 }}>Koya could not finish reading.</h1>
        <p className="body-l" style={{ marginBottom: 8 }}>
          The marks are safe. This is usually the connection, not your class.
        </p>
        <p style={{ fontSize: '.8rem', color: 'var(--ink-3)', marginBottom: 28 }}>{error}</p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={onRetry}>Try reading again</button>
          <button className="btn btn-quiet" onClick={onReset}>Start over</button>
        </div>
      </div>
    </div>
  )
}
