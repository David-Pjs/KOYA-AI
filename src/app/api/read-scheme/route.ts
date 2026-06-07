import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

const ALLOWED = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/heic', 'image/heif']
const MAX_BYTES = 20 * 1024 * 1024 // 20MB

export const maxDuration = 300

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file    = (formData.get('photo') ?? formData.get('file')) as File | null
    const subject = formData.get('subject') as string

    if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    if (file.size > MAX_BYTES) {
      return NextResponse.json({ error: 'That file is over 20MB. Try a single page or a smaller scan.' }, { status: 400 })
    }

    const mimeType = file.type || 'application/octet-stream'
    if (!ALLOWED.includes(mimeType)) {
      return NextResponse.json({ error: 'Upload a PDF or a photo of the page (PNG, JPG, or WEBP).' }, { status: 400 })
    }

    const bytes  = await file.arrayBuffer()
    const base64 = Buffer.from(bytes).toString('base64')

    const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' })
    const result = await model.generateContent({
      contents: [{
        role: 'user',
        parts: [
          { inlineData: { data: base64, mimeType } },
          { text: `This is a Nigerian or African secondary school ${subject} scheme of work or lesson plan. It may be a multi-page PDF, a printed Ministry booklet, a typed school document, a handwritten plan, or a WhatsApp photo.

Read it and return the list of topics it covers, in order, with the week and term for each if shown. Use the exact wording from the document. Then return the full extracted text faithfully (do not invent content).

Respond ONLY with valid JSON:
{
  "topics": [
    { "title": "exact topic title from the document", "week": "term and week if shown, else empty string" }
  ],
  "text": "the full extracted text of the relevant section(s)"
}` },
        ],
      }],
      generationConfig: { responseMimeType: 'application/json' },
    })

    const parsed = JSON.parse(result.response.text()) as { topics?: { title: string; week?: string }[]; text?: string }
    const topics = (parsed.topics || []).filter(t => t.title?.trim()).slice(0, 20)
    return NextResponse.json({ topics, text: parsed.text || '' })
  } catch (err) {
    console.error('[read-scheme]', err)
    return NextResponse.json({ error: 'Could not read that document', detail: String(err) }, { status: 500 })
  }
}
