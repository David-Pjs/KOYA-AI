'use client'

import { useState } from 'react'
import type { ClassSetup, Question } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  setup: ClassSetup
  questions: Question[]
  groundedSource?: string
  onBack: () => void
  onEnterMarks: () => void
  onReadPapers: () => void
}

export default function Board({ setup, questions, groundedSource, onBack, onEnterMarks, onReadPapers }: Props) {
  const [showAnswers, setShowAnswers] = useState(true)
  return (
    <div className="stage">
      <div className="col">
        <header className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(2rem, 5vw, 3.25rem)' }}>
          <Wordmark onClick={onBack} />
          <span className="label" style={{ color: 'var(--ink-3)' }}>{setup.subject} · {setup.topic}</span>
        </header>

        <p className="label rise" style={{ color: 'var(--terra-deep)', marginBottom: 14 }}>Step two of three</p>
        <h1 className="display-l rise" style={{ animationDelay: '.06s', marginBottom: 14 }}>Write these on the board.</h1>
        <p className="body-l rise" style={{ animationDelay: '.12s', maxWidth: '46ch', marginBottom: 20 }}>
          None of them is about {setup.topic.toLowerCase()}. Each one quietly tests a skill
          this week leans on. Give the class ten minutes, pen and paper, then come back with
          the exercise books.
        </p>

        <div className="no-print rise" style={{ animationDelay: '.14s', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
          <p style={{ margin: 0, fontSize: '.82rem', color: 'var(--ink-3)' }}>
            Your marking key is shown so you can mark fast. Hide it if your screen faces the class.
          </p>
          <button className="btn-ghost" onClick={() => setShowAnswers(v => !v)} style={{ whiteSpace: 'nowrap' }}>
            {showAnswers ? 'Hide answer key' : 'Show answer key'}
          </button>
        </div>

        <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {questions.map((q, i) => (
            <li
              key={i}
              className="paper-card rise"
              style={{ animationDelay: `${0.16 + i * 0.06}s`, padding: '18px 20px', display: 'flex', gap: 18, alignItems: 'flex-start' }}
            >
              <span className="disc" style={{ marginTop: 2 }}>{i + 1}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="font-display" style={{ fontSize: '1.3rem', fontWeight: 500, lineHeight: 1.35, margin: '0 0 12px', letterSpacing: '-0.01em' }}>
                  {q.question}
                </p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span className="chip chip-green">Tests · {q.skill_tested}</span>
                  <span className="chip chip-terra">From · {q.prerequisite_from}</span>
                </div>
                {q.answer && (showAnswers ? (
                  <p className="answer-key" style={{ margin: '12px 0 0', display: 'flex', alignItems: 'center', gap: 8, fontSize: '.9rem' }}>
                    <span style={{ color: 'var(--ok)', fontWeight: 700 }}>✓ Answer</span>
                    <span className="num" style={{ fontSize: '1.05rem', color: 'var(--ink)' }}>{q.answer}</span>
                  </p>
                ) : (
                  <p className="no-print" style={{ margin: '12px 0 0', fontSize: '.82rem', color: 'var(--ink-3)', fontStyle: 'italic' }}>Answer hidden</p>
                ))}
              </div>
            </li>
          ))}
        </ol>

        {groundedSource && (
          <p style={{ marginTop: 18, fontSize: '.78rem', color: 'var(--ink-3)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ color: 'var(--ok)' }}>✓</span>
            Class levels grounded in the {groundedSource}, not estimated.
          </p>
        )}

        <div className="no-print" style={{ marginTop: groundedSource ? 20 : 32 }}>
          <p className="label" style={{ marginBottom: 12 }}>When the class is done, two ways to give Koya the marks</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <button className="btn btn-primary" onClick={onEnterMarks} style={{ width: '100%' }}>
              Enter the counts yourself
            </button>
            <button className="btn btn-quiet" onClick={onReadPapers} style={{ width: '100%' }}>
              Or photograph the books · Koya reads the mistakes
            </button>
          </div>
          <button className="btn-ghost" onClick={() => window.print()} style={{ display: 'block', margin: '18px auto 0' }}>
            Print this sheet for the board
          </button>
        </div>
      </div>
    </div>
  )
}
