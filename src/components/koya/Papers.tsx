'use client'

import { useRef, useState } from 'react'
import type { ClassSetup } from '@/lib/koya'
import Wordmark from './Wordmark'

interface Props {
  setup: ClassSetup
  onBack: () => void
  onUseCounts: () => void
  onSubmit: (files: File[]) => void
}

export default function Papers({ setup, onBack, onUseCounts, onSubmit }: Props) {
  const [files, setFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)

  function add(list: FileList) {
    const incoming = Array.from(list).slice(0, 15 - files.length)
    setFiles(f => [...f, ...incoming])
    incoming.forEach(file => {
      const r = new FileReader()
      r.onload = e => setPreviews(p => [...p, e.target?.result as string])
      r.readAsDataURL(file)
    })
  }
  function removeAt(i: number) {
    setFiles(f => f.filter((_, x) => x !== i))
    setPreviews(p => p.filter((_, x) => x !== i))
  }

  return (
    <div className="stage">
      <div className="col">
        <header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'clamp(1.5rem, 4vw, 2.5rem)' }}>
          <Wordmark onClick={onBack} />
          <button className="btn-ghost" onClick={onBack}>← Questions</button>
        </header>

        <p className="label" style={{ color: 'var(--terra-deep)', marginBottom: 14 }}>Step three · let Koya read</p>
        <h1 className="display-l" style={{ marginBottom: 14 }}>Show Koya the marked books.</h1>
        <p className="body-l" style={{ maxWidth: '46ch', marginBottom: 28 }}>
          Photograph the answer sheets, one student per photo. Koya reads the actual working
          and finds the real mistake in each, not just whether it is wrong. A handful is
          enough to see the pattern.
        </p>

        {previews.length > 0 && (
          <div className="papers-grid" style={{ marginBottom: 18 }}>
            {previews.map((src, i) => (
              <div key={i} style={{ position: 'relative', borderRadius: 'var(--radius-sm)', overflow: 'hidden', border: '1.5px solid var(--line)' }}>
                <img src={src} alt={`Paper ${i + 1}`} style={{ width: '100%', aspectRatio: '3/4', objectFit: 'cover', display: 'block' }} />
                <button
                  onClick={() => removeAt(i)}
                  aria-label="remove"
                  style={{ position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: '50%', border: 'none', background: 'oklch(24% 0.012 70 / 0.6)', color: 'var(--paper-raised)', cursor: 'pointer', fontSize: 14, lineHeight: 1 }}
                >×</button>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => fileRef.current?.click()}
          className="paper-card"
          style={{ width: '100%', padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', borderStyle: 'dashed', borderColor: 'var(--line-strong)', textAlign: 'left', background: 'var(--paper-raised)' }}
        >
          <span style={{ fontSize: 22 }}>📷</span>
          <div>
            <p style={{ margin: 0, fontWeight: 600, color: 'var(--ink-2)', fontSize: '.95rem' }}>
              {files.length ? 'Add more papers' : 'Add photos of the marked papers'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '.82rem', color: 'var(--ink-3)' }}>
              {files.length ? `${files.length} added · up to 15` : 'One student per photo · up to 15'}
            </p>
          </div>
        </button>
        <input ref={fileRef} type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={e => { if (e.target.files) add(e.target.files) }} />

        <button
          className="btn btn-primary"
          disabled={files.length === 0}
          onClick={() => onSubmit(files)}
          style={{ width: '100%', marginTop: 26 }}
        >
          {files.length ? `Read ${files.length} ${files.length === 1 ? 'paper' : 'papers'} and diagnose` : 'Add at least one paper'}
        </button>

        <button className="btn-ghost" onClick={onUseCounts} style={{ display: 'block', margin: '18px auto 0' }}>
          No camera handy? Enter the counts instead
        </button>
      </div>
    </div>
  )
}
