import { NextRequest, NextResponse } from 'next/server'
import { readImage, extractJson, hasVisionKey } from '@/lib/vision'

const MAX_PAPERS = 15
const MAX_BYTES = 12 * 1024 * 1024

export const maxDuration = 300

interface PaperReading {
  wrong: number[]
  errors: { q: number; error: string }[]
}

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData()
    const photos = form.getAll('photos').filter(f => f instanceof File) as File[]
    const topic = form.get('topic') as string
    const subject = form.get('subject') as string
    const questions = JSON.parse((form.get('questions') as string) || '[]') as { question: string; skill_tested: string }[]

    if (photos.length === 0) return NextResponse.json({ error: 'No papers provided' }, { status: 400 })
    if (questions.length === 0) return NextResponse.json({ error: 'Questions missing' }, { status: 400 })
    if (!hasVisionKey()) {
      return NextResponse.json({
        error: 'The image reader is not set up yet. For now, enter the counts by hand instead.',
      }, { status: 422 })
    }

    const batch = photos.slice(0, MAX_PAPERS).filter(p => p.size <= MAX_BYTES)
    const qList = questions.map((q, i) => `Q${i + 1}: ${q.question}  [skill: ${q.skill_tested}]`).join('\n')

    const readings = await Promise.all(
      batch.map(async (file): Promise<PaperReading | null> => {
        try {
          const base64 = Buffer.from(await file.arrayBuffer()).toString('base64')
          const instruction = `This is a photo of one Nigerian secondary school student's marked answer paper for a ${subject} diagnostic on "${topic}".

The questions were:
${qList}

Read the student's actual working. Nigerian handwriting can differ from Western styles; use the maths context to interpret. For each question, decide if the final answer is WRONG, and if so describe the specific mistake in the working (wrong sign, wrong operation, blank, wrong method). Be concrete and short.

Respond ONLY with JSON:
{ "wrong": [question numbers the student got wrong], "errors": [ { "q": number, "error": "short specific description" } ] }`
          const text = await readImage(base64, file.type || 'image/jpeg', instruction)
          const parsed = extractJson<PaperReading>(text)
          if (!parsed || !Array.isArray(parsed.wrong)) return null
          return parsed
        } catch {
          return null
        }
      }),
    )

    const valid = readings.filter((r): r is PaperReading => r !== null)
    if (valid.length === 0) {
      return NextResponse.json({ error: 'Koya could not read those papers clearly. Try clearer photos, or enter the counts instead.' }, { status: 422 })
    }

    const wrongInSample = questions.map((_, i) =>
      valid.filter(r => r.wrong.includes(i + 1)).length,
    )

    const notesByQ = new Map<number, string[]>()
    for (const r of valid) for (const e of r.errors || []) {
      if (!notesByQ.has(e.q)) notesByQ.set(e.q, [])
      notesByQ.get(e.q)!.push(e.error)
    }
    const notes: string[] = []
    for (const [q, errs] of [...notesByQ.entries()].sort((a, b) => a[0] - b[0])) {
      if (errs[0]) notes.push(`Q${q}: ${errs[0]}`)
    }

    return NextResponse.json({ sampleSize: valid.length, wrongInSample, notes })
  } catch (err) {
    console.error('[read-papers]', err)
    return NextResponse.json({ error: 'Could not read the papers', detail: String(err) }, { status: 500 })
  }
}
