import { NextRequest, NextResponse } from 'next/server'
import { generateDiagnostic } from '@/lib/pipeline'

export async function POST(req: NextRequest) {
  try {
    const { topic, subject, context } = await req.json()
    if (!topic || !subject) {
      return NextResponse.json({ error: 'topic and subject required' }, { status: 400 })
    }
    const result = await generateDiagnostic(topic, subject, context)
    return NextResponse.json(result)
  } catch (err) {
    console.error('[diagnostic]', err)
    return NextResponse.json({ error: 'Failed', detail: String(err) }, { status: 500 })
  }
}
