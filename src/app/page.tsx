'use client'

import { useState } from 'react'
import type { ClassSetup, Diagnosis, Question } from '@/lib/koya'
import { analyzeResults, generateQuestions, readPapers } from '@/lib/koya'
import Home from '@/components/koya/Home'
import Setup from '@/components/koya/Setup'
import Generating from '@/components/koya/Generating'
import Board from '@/components/koya/Board'
import Marks from '@/components/koya/Marks'
import Papers from '@/components/koya/Papers'
import Reveal from '@/components/koya/Reveal'

type Stage = 'home' | 'setup' | 'generating' | 'board' | 'marks' | 'papers' | 'reveal'

export default function Koya() {
  const [stage, setStage] = useState<Stage>('home')
  const [setup, setSetup] = useState<ClassSetup | null>(null)
  const [questions, setQuestions] = useState<Question[]>([])
  const [groundedSource, setGroundedSource] = useState<string | undefined>(undefined)
  const [wrongCounts, setWrongCounts] = useState<number[]>([])
  const [diagnosis, setDiagnosis] = useState<Diagnosis | null>(null)
  const [readingScheme, setReadingScheme] = useState(false)
  const [genMode, setGenMode] = useState<'questions' | 'papers'>('questions')
  const [error, setError] = useState<string | null>(null)

  async function startQuestions(s: ClassSetup) {
    setSetup(s)
    setReadingScheme(!!s.schemeText)
    setGenMode('questions')
    setStage('generating')
    setError(null)
    try {
      const qs = await generateQuestions(s)
      setQuestions(qs.questions)
      setGroundedSource(qs.grounded ? qs.source : undefined)
      setStage('board')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStage('setup')
    }
  }

  async function runAnalysis(counts: number[], s: ClassSetup, paperNotes?: string[]) {
    setDiagnosis(null)
    setError(null)
    setWrongCounts(counts)
    setStage('reveal')
    try {
      const d = await analyzeResults(s, questions, counts, paperNotes)
      setDiagnosis(d)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
    }
  }

  async function runFromPapers(files: File[], s: ClassSetup) {
    setDiagnosis(null)
    setError(null)
    setGenMode('papers')
    setStage('generating') // Groq reads the papers here
    try {
      const read = await readPapers(files, s, questions)
      // Honest: diagnose the papers actually read, do not extrapolate to the
      // whole class. The cohort for this run IS the sample Koya read.
      const sampleSetup: ClassSetup = { ...s, studentCount: read.sampleSize }
      setSetup(sampleSetup)
      await runAnalysis(read.wrongInSample, sampleSetup, read.notes)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong')
      setStage('papers')
    }
  }

  function reset() {
    setStage('home')
    setSetup(null)
    setQuestions([])
    setWrongCounts([])
    setDiagnosis(null)
    setError(null)
  }

  if (stage === 'home') return <Home onStart={() => setStage('setup')} />

  if (stage === 'setup')
    return <Setup onBack={reset} onSubmit={startQuestions} />

  if (stage === 'generating' && setup)
    return <Generating setup={setup} readingScheme={readingScheme} mode={genMode} />

  if (stage === 'board' && setup)
    return (
      <Board
        setup={setup}
        questions={questions}
        groundedSource={groundedSource}
        onBack={() => setStage('setup')}
        onEnterMarks={() => setStage('marks')}
        onReadPapers={() => setStage('papers')}
      />
    )

  if (stage === 'marks' && setup)
    return (
      <Marks
        setup={setup}
        questions={questions}
        onBack={() => setStage('board')}
        onUsePhotos={() => setStage('papers')}
        onSubmit={counts => runAnalysis(counts, setup)}
      />
    )

  if (stage === 'papers' && setup)
    return (
      <Papers
        setup={setup}
        onBack={() => setStage('board')}
        onUseCounts={() => setStage('marks')}
        onSubmit={files => runFromPapers(files, setup)}
      />
    )

  if (stage === 'reveal' && setup)
    return (
      <Reveal
        setup={setup}
        questions={questions}
        wrongCounts={wrongCounts}
        diagnosis={diagnosis}
        error={error}
        onReset={reset}
        onRetry={() => runAnalysis(wrongCounts, setup)}
      />
    )

  return <Home onStart={() => setStage('setup')} />
}
