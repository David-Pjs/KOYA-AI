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
    const topic   = formData.get('topic') as string
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
    const result = await model.generateContent([
      { inlineData: { data: base64, mimeType } },
      `This is a Nigerian or African secondary school scheme of work or lesson plan. It may be a multi-page PDF, a printed Ministry of Education booklet, a typed school document, a handwritten plan, or a photo forwarded on WhatsApp.

Subject: ${subject}
Topic the teacher is focused on this week: ${topic}

Find the part of this document that covers "${topic}" (or the closest week to it) and extract, in plain text:
1. The topic title, week number, and term if visible
2. The learning objectives for that topic
3. The content and sub-topics listed under it
4. Any stated prerequisite knowledge or "previous knowledge" the document expects
5. Teacher activities or teaching methods listed

If "${topic}" is not in the document, extract the overall scope and sequence so the surrounding topics are clear. Keep it concise and faithful to the document. Do not invent content that is not there.`,
    ])

    const text = result.response.text()
    return NextResponse.json({ text })
  } catch (err) {
    console.error('[read-scheme]', err)
    return NextResponse.json({ error: 'Could not read that document', detail: String(err) }, { status: 500 })
  }
}
