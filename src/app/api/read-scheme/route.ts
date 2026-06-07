import { NextRequest, NextResponse } from 'next/server'
import { extractText, getDocumentProxy } from 'unpdf'
import { structureSchemeText } from '@/lib/pipeline'
import { readImage, extractJson, hasVisionKey } from '@/lib/vision'

const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 20 * 1024 * 1024 // 20MB

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file    = (formData.get('photo') ?? formData.get('file')) as File | null
    const subject = (formData.get('subject') as string) || 'Mathematics'

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That file is over 20MB. Try a single page or a smaller scan.' }, { status: 400 })
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED.includes(mimeType)) {
      return NextResponse.json({ error: 'Upload a PDF or a photo of the page (PNG, JPG, or WEBP).' }, { status: 400 })
    }

    const bytes = await file.arrayBuffer()

    // ── Path 1: digital PDF — extract text with unpdf (free, no vision) ──
    if (mimeType === 'application/pdf') {
      try {
        // pass a COPY: pdf.js detaches the buffer it receives, and we still
        // need the original bytes for the vision fallback below.
        const pdf = await getDocumentProxy(new Uint8Array(bytes.slice(0)))
        const { text } = await extractText(pdf, { mergePages: true })
        const clean = (text || '').replace(/\s+\n/g, '\n').trim()
        if (clean.length > 200) {
          const structured = await structureSchemeText(clean, subject)
          return NextResponse.json({ ...structured, via: 'pdf-text' })
        }
        // scanned PDF with no text layer — needs vision
      } catch (e) {
        console.error('[read-scheme] unpdf failed, will try vision', e)
      }
    }

    // ── Path 2: image or scanned PDF — Groq vision ──
    if (!hasVisionKey()) {
      const why = mimeType === 'application/pdf'
        ? 'This looks like a scanned PDF with no text layer.'
        : 'Photos need the image reader.'
      return NextResponse.json({
        error: `${why} Upload a normal (digital) PDF for now, or just type the topic.`,
      }, { status: 422 })
    }

    const base64 = Buffer.from(bytes).toString('base64')
    const instruction = `This is a Nigerian or African secondary school ${subject} scheme of work. Read it and return the list of topics it covers, in order, with the week and term for each if shown. Use the exact wording. Then return the full extracted text faithfully.

Respond ONLY with JSON:
{ "topics": [ { "title": "exact topic title", "week": "term and week if shown, else empty string" } ], "text": "the full extracted text" }`
    const text = await readImage(base64, mimeType, instruction)
    const parsed = extractJson<{ topics?: { title: string; week?: string }[]; text?: string }>(text)
    const topics = (parsed?.topics || []).filter(t => t.title?.trim()).slice(0, 25)
    return NextResponse.json({ topics, text: parsed?.text || '', via: 'vision' })
  } catch (err) {
    console.error('[read-scheme]', err)
    return NextResponse.json({ error: 'Could not read that document', detail: String(err) }, { status: 500 })
  }
}
