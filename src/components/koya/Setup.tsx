'use client'

import { useRef, useState } from 'react'
import type { ClassSetup, SchemeTopic } from '@/lib/koya'
import { readScheme } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  onBack: () => void
  onSubmit: (setup: ClassSetup) => void
}

export default function Setup({ onBack, onSubmit }: Props) {
  const [subject, setSubject] = useState('Mathematics')
  const [topic, setTopic] = useState('Simultaneous Equations')
  const [klass, setKlass] = useState('SS2')
  const [week, setWeek] = useState('First Term · Week 9')
  const [studentCount, setStudentCount] = useState(52)

  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [reading, setReading] = useState(false)
  const [topics, setTopics] = useState<SchemeTopic[]>([])
  const [schemeText, setSchemeText] = useState('')
  const [schemeError, setSchemeError] = useState('')
  const [pickedTopic, setPickedTopic] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ready = subject.trim() && topic.trim() && studentCount > 0 && !reading

  async function pickFile(f: File) {
    setFile(f)
    setTopics([]); setSchemeError(''); setSchemeText(''); setPickedTopic(null)
    if (f.type.startsWith('image/')) {
      const r = new FileReader()
      r.onload = e => setPreview(e.target?.result as string)
      r.readAsDataURL(f)
    } else {
      setPreview(null)
    }
    setReading(true)
    try {
      const { topics, text } = await readScheme(f, subject)
      setSchemeText(text)
      setTopics(topics)
      if (topics.length === 0) setSchemeError('Koya read it but could not pick out clear topics. You can still type the topic below.')
    } catch (e) {
      setSchemeError(e instanceof Error ? e.message : 'Could not read that document. Type your topic instead.')
    } finally {
      setReading(false)
    }
  }

  function clearScheme() {
    setFile(null); setPreview(null); setTopics([]); setSchemeText(''); setSchemeError(''); setPickedTopic(null)
  }

  function chooseTopic(t: SchemeTopic) {
    setTopic(t.title)
    setPickedTopic(t.title)
    if (t.week?.trim()) setWeek(t.week)
  }

  function submit() {
    onSubmit({ subject, topic, klass, week, studentCount, schemeText: schemeText || undefined })
  }

  return (
    <div className="stage">
      <div className="col">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(2rem, 5vw, 3.5rem)' }}>
          <Wordmark onClick={onBack} />
          <button className="btn-ghost" onClick={onBack}>← Back</button>
        </header>

        <p className="label" style={{ color: 'var(--terra-deep)', marginBottom: 14 }}>Step one of three</p>
        <h1 className="display-l" style={{ marginBottom: 14 }}>Tell Koya about the class.</h1>
        <p className="body-l" style={{ maxWidth: '44ch', marginBottom: 40 }}>
          Type the topic, or hand Koya your scheme of work and pick it from what your booklet
          actually lists. Either way, this is the only typing you do until the marks come in.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Subject" value={subject} onChange={setSubject} placeholder="Mathematics, Biology, Physics" />

          <SchemeUpload
            file={file}
            preview={preview}
            reading={reading}
            topics={topics}
            pickedTopic={pickedTopic}
            error={schemeError}
            onPick={pickFile}
            onClear={clearScheme}
            onChoose={chooseTopic}
            fileRef={fileRef}
          />

          <Field
            label={pickedTopic ? 'Topic this week · from your scheme' : 'Topic this week'}
            value={topic}
            onChange={v => { setTopic(v); setPickedTopic(null) }}
            placeholder="Simultaneous Equations, Photosynthesis"
          />

          <div className="setup-row">
            <Field label="Class" value={klass} onChange={setKlass} placeholder="SS2" />
            <Field label="Term & week" value={week} onChange={setWeek} placeholder="First Term · Week 9" />
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 10 }}>Students</label>
              <Stepper value={studentCount} onChange={setStudentCount} />
            </div>
          </div>
        </div>

        <button className="btn btn-primary" disabled={!ready} onClick={submit} style={{ width: '100%', marginTop: 34 }}>
          {reading ? 'Koya is reading your scheme…' : 'Write the diagnostic questions'}
        </button>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder: string }) {
  return (
    <div>
      <label className="label" style={{ display: 'block', marginBottom: 10 }}>{label}</label>
      <input className="field" value={value} placeholder={placeholder} onChange={e => onChange(e.target.value)} />
    </div>
  )
}

function Stepper({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const set = (n: number) => onChange(Math.max(1, Math.min(200, n)))
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <StepBtn label="−" onClick={() => set(value - 1)} />
      <input
        className="field"
        type="number"
        value={value}
        onChange={e => set(parseInt(e.target.value) || 1)}
        style={{ width: 72, textAlign: 'center', fontWeight: 700, padding: '.9rem 0' }}
      />
      <StepBtn label="+" onClick={() => set(value + 1)} />
    </div>
  )
}

function StepBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label={label === '−' ? 'fewer' : 'more'}
      style={{
        width: 46, height: 46, flexShrink: 0, borderRadius: 'var(--radius-sm)',
        border: '1.5px solid var(--line-strong)', background: 'var(--paper-raised)',
        color: 'var(--ink-2)', fontSize: 22, lineHeight: 1, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  )
}

function SchemeUpload({ file, preview, reading, topics, pickedTopic, error, onPick, onClear, onChoose, fileRef }: {
  file: File | null
  preview: string | null
  reading: boolean
  topics: SchemeTopic[]
  pickedTopic: string | null
  error: string
  onPick: (f: File) => void
  onClear: () => void
  onChoose: (t: SchemeTopic) => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const isPdf = !!file && !preview
  return (
    <div>
      <label className="label" style={{ display: 'block', marginBottom: 10 }}>Your scheme of work — optional</label>

      <div
        onClick={() => !reading && fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${file ? 'var(--green)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--radius)', overflow: 'hidden', cursor: reading ? 'default' : 'pointer',
          background: 'var(--paper-raised)',
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="Your scheme of work" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'oklch(24% 0.012 70 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ color: 'var(--paper-raised)', fontWeight: 700, fontSize: '.9rem' }}>
                {reading ? 'Koya is reading this…' : 'Koya read this page'}
              </span>
              {!reading && <button onClick={e => { e.stopPropagation(); onClear() }} className="chip" style={{ background: 'oklch(99% 0 0 / 0.25)', color: 'var(--paper-raised)', cursor: 'pointer' }}>Remove</button>}
            </div>
          </div>
        ) : isPdf ? (
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>📑</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--green-ink)', fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file!.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '.8rem', color: 'var(--ink-3)' }}>{reading ? 'Koya is reading this scheme…' : 'Koya read this scheme'}</p>
            </div>
            {!reading && <button onClick={e => { e.stopPropagation(); onClear() }} className="chip chip-terra" style={{ cursor: 'pointer' }}>Remove</button>}
          </div>
        ) : (
          <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink-2)', fontSize: '.95rem' }}>Upload your scheme of work — PDF or a photo</p>
              <p style={{ margin: '2px 0 0', fontSize: '.82rem', color: 'var(--ink-3)' }}>Koya reads it and lets you pick the week. No scheme? Just type the topic above.</p>
            </div>
          </div>
        )}
      </div>

      {reading && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
          <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
          <span style={{ fontSize: '.85rem', color: 'var(--ink-2)' }}>Reading your scheme and pulling out the topics…</span>
        </div>
      )}

      {!reading && topics.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <p className="label" style={{ color: 'var(--green-ink)', marginBottom: 10 }}>Koya found these in your scheme · tap your topic</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {topics.map((t, i) => {
              const active = pickedTopic === t.title
              return (
                <button
                  key={i}
                  onClick={() => onChoose(t)}
                  style={{
                    textAlign: 'left', cursor: 'pointer',
                    border: `1.5px solid ${active ? 'var(--green)' : 'var(--line-strong)'}`,
                    background: active ? 'var(--green-wash)' : 'var(--paper-raised)',
                    borderRadius: 99, padding: '8px 14px',
                    transition: 'all .15s var(--ease)',
                  }}
                >
                  <span style={{ fontSize: '.88rem', fontWeight: 600, color: active ? 'var(--green-ink)' : 'var(--ink)' }}>{t.title}</span>
                  {t.week?.trim() && <span style={{ fontSize: '.74rem', color: 'var(--ink-3)', marginLeft: 8 }}>{t.week}</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {!reading && error && (
        <p style={{ marginTop: 12, fontSize: '.85rem', color: 'var(--terra-deep)' }}>{error}</p>
      )}

      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) onPick(e.target.files[0]) }} />
    </div>
  )
}
