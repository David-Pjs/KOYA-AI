// Vision layer — the "eyes" of Koya.
//
// Groq runs Llama 4 Scout (multimodal) fast and on a free key, so it reads a
// snapped student paper or a photographed scheme of work. Its findings are then
// handed to DeepSeek V4 (the "brain") for the class-wide diagnosis. Two models,
// each doing what it is best at: Groq sees, DeepSeek reasons.

import OpenAI from 'openai'

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || '',
  baseURL: 'https://api.groq.com/openai/v1',
})

export const VISION_MODEL = 'meta-llama/llama-4-scout-17b-16e-instruct'

export function hasVisionKey(): boolean {
  const k = process.env.GROQ_API_KEY
  return !!k && k.startsWith('gsk_') && k.length > 20
}

// Read an image with a text instruction. Returns the raw model text.
export async function readImage(
  base64: string,
  mimeType: string,
  instruction: string,
): Promise<string> {
  const res = await groq.chat.completions.create({
    model: VISION_MODEL,
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: instruction },
          { type: 'image_url', image_url: { url: `data:${mimeType};base64,${base64}` } },
        ] as never,
      },
    ],
    temperature: 0.2,
    max_tokens: 1200,
  })
  return res.choices[0]?.message?.content ?? ''
}

// Tolerant JSON extraction from a model response that should be JSON.
export function extractJson<T>(text: string): T | null {
  try {
    return JSON.parse(text) as T
  } catch {
    const start = text.indexOf('{')
    const end = text.lastIndexOf('}')
    if (start >= 0 && end > start) {
      try {
        return JSON.parse(text.slice(start, end + 1)) as T
      } catch {
        return null
      }
    }
    return null
  }
}
