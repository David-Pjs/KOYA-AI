'use client'

import { useRef, useState } from 'react'
import type { ClassSetup } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  onBack: () => void
  onSubmit: (setup: ClassSetup, photo: File | null) => void
}

export default function Setup({ onBack, onSubmit }: Props) {
  const [subject, setSubject] = useState('Mathematics')
  const [topic, setTopic] = useState('Simultaneous Equations')
  const [klass, setKlass] = useState('SS2')
  const [week, setWeek] = useState('First Term · Week 9')
  const [studentCount, setStudentCount] = useState(52)
  const [photo, setPhoto] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const ready = subject.trim() && topic.trim() && studentCount > 0

  function pickPhoto(file: File) {
    setPhoto(file)
    if (file.type.startsWith('image/')) {
      const r = new FileReader()
      r.onload = e => setPreview(e.target?.result as string)
      r.readAsDataURL(file)
    } else {
      setPreview(null) // PDFs and other docs: no image preview
    }
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
          Just enough to write the right questions. This is the only typing you do until
          the marks come in.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
          <Field label="Subject" value={subject} onChange={setSubject} placeholder="Mathematics, Biology, Physics" />
          <Field label="Topic this week" value={topic} onChange={setTopic} placeholder="Simultaneous Equations, Photosynthesis" />

          <div className="setup-row">
            <Field label="Class" value={klass} onChange={setKlass} placeholder="SS2" />
            <Field label="Term & week" value={week} onChange={setWeek} placeholder="First Term · Week 9" />
            <div>
              <label className="label" style={{ display: 'block', marginBottom: 10 }}>Students</label>
              <Stepper value={studentCount} onChange={setStudentCount} />
            </div>
          </div>

          <SchemeUpload
            photo={photo}
            preview={preview}
            onPick={pickPhoto}
            onClear={() => { setPhoto(null); setPreview(null) }}
            fileRef={fileRef}
          />
        </div>

        <button
          className="btn btn-primary"
          disabled={!ready}
          onClick={() => onSubmit({ subject, topic, klass, week, studentCount }, photo)}
          style={{ width: '100%', marginTop: 34 }}
        >
          {photo ? 'Read my booklet and write the questions' : 'Write the diagnostic questions'}
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

function SchemeUpload({ photo, preview, onPick, onClear, fileRef }: {
  photo: File | null
  preview: string | null
  onPick: (f: File) => void
  onClear: () => void
  fileRef: React.RefObject<HTMLInputElement | null>
}) {
  const isPdf = !!photo && !preview
  return (
    <div>
      <label className="label" style={{ display: 'block', marginBottom: 10 }}>Your scheme of work — optional</label>
      <div
        onClick={() => fileRef.current?.click()}
        style={{
          border: `1.5px dashed ${photo ? 'var(--green)' : 'var(--line-strong)'}`,
          borderRadius: 'var(--radius)', overflow: 'hidden', cursor: 'pointer',
          background: 'var(--paper-raised)',
        }}
      >
        {preview ? (
          <div style={{ position: 'relative' }}>
            <img src={preview} alt="Your scheme of work" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block' }} />
            <div style={{ position: 'absolute', inset: 0, background: 'oklch(24% 0.012 70 / 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
              <span style={{ color: 'var(--paper-raised)', fontWeight: 700, fontSize: '.9rem' }}>Koya will read this page</span>
              <button onClick={e => { e.stopPropagation(); onClear() }} className="chip" style={{ background: 'oklch(99% 0 0 / 0.25)', color: 'var(--paper-raised)', cursor: 'pointer' }}>Remove</button>
            </div>
          </div>
        ) : isPdf ? (
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>📑</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: 0, fontWeight: 700, color: 'var(--green-ink)', fontSize: '.9rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{photo!.name}</p>
              <p style={{ margin: '2px 0 0', fontSize: '.8rem', color: 'var(--ink-3)' }}>Koya will read this scheme and pull out your week</p>
            </div>
            <button onClick={e => { e.stopPropagation(); onClear() }} className="chip chip-terra" style={{ cursor: 'pointer' }}>Remove</button>
          </div>
        ) : (
          <div style={{ padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <span style={{ fontSize: 22 }}>📄</span>
            <div>
              <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink-2)', fontSize: '.95rem' }}>Upload your scheme of work — PDF or a photo</p>
              <p style={{ margin: '2px 0 0', fontSize: '.82rem', color: 'var(--ink-3)' }}>A booklet, a school PDF, or a snap of the page. No scheme? Koya knows the curriculum.</p>
            </div>
          </div>
        )}
      </div>
      <input ref={fileRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={e => { if (e.target.files?.[0]) onPick(e.target.files[0]) }} />
    </div>
  )
}
