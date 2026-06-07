import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import { lookupCurriculum, curriculumGrounding, CURRICULUM_SOURCE, CURRICULUM_COUNTRY } from './curriculum'
import { buildVerifiedDiagnostic } from './questionbank'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

const gemini = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')

export function hasGeminiKey(): boolean {
  const k = process.env.GEMINI_API_KEY
  return !!k && k !== 'your_gemini_key_here' && k.length > 10
}

// ─── SCHEME OF WORK: structure raw text into topics (no vision needed) ───────
// Used for digital PDFs whose text we extract with unpdf, so a scheme PDF works
// on the DeepSeek key alone, with no Gemini and no cost beyond one flash call.

export async function structureSchemeText(
  rawText: string,
  subject: string,
): Promise<{ topics: { title: string; week?: string }[]; text: string }> {
  const text = rawText.slice(0, 24000) // cap context
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: 'You read Nigerian/African secondary school schemes of work and extract the topic list. Respond only with valid JSON.',
      },
      {
        role: 'user',
        content: `This is the extracted text of a ${subject} scheme of work. Pull out the list of topics it covers, in order, with the week and term for each if shown. Use the exact wording from the document. Ignore page headers, footers, and advertising text.

SCHEME TEXT:
${text}

Return JSON: { "topics": [ { "title": "exact topic title", "week": "term and week if shown, else empty string" } ] }`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })
  const parsed = JSON.parse(response.choices[0].message.content!) as { topics?: { title: string; week?: string }[] }
  const topics = (parsed.topics || []).filter(t => t.title?.trim()).slice(0, 25)
  return { topics, text }
}

// ─── OCR ────────────────────────────────────────────────────────────────────

export async function readPhotoWithGemini(
  base64Image: string,
  mimeType: string,
  topic: string,
  subject: string
): Promise<string> {
  const model = gemini.getGenerativeModel({ model: 'gemini-2.0-flash' })

  const result = await model.generateContent([
    { inlineData: { data: base64Image, mimeType } },
    `You are reading a Nigerian secondary school student's handwritten answer paper.

Topic: ${topic}
Subject: ${subject}
Context: West African classroom. The student may use Nigerian handwriting styles — letters and numbers may look different from Western standards. Use the mathematical context to interpret ambiguous characters.

Do not just extract text. Describe what the student ATTEMPTED mathematically:
- What method did they use?
- Where exactly did their working go wrong?
- What specific error did they make — wrong sign, wrong operation, wrong formula, blank?
- If you cannot read a character, use the surrounding maths to infer what it likely is.

Be specific. Write like you are explaining the student's mistake to their teacher.`,
  ])

  return result.response.text()
}

// ─── INTERPRET TEACHER LANGUAGE ─────────────────────────────────────────────

export async function interpretTeacherDescription(
  description: string,
  topic: string,
  subject: string,
  studentCount: number
): Promise<{ cleanedDescription: string; estimatedAffected: number }> {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-pro',
    messages: [
      {
        role: 'system',
        content: `You help interpret what Nigerian teachers say about their classes.
Teachers often speak informally, mix English with Pidgin, use vague estimates, or describe things casually.
Your job is to extract the core meaning and estimate numbers precisely.
Respond only with valid JSON.`,
      },
      {
        role: 'user',
        content: `A teacher of ${studentCount} students said this about their class after teaching ${topic} (${subject}):

"${description}"

Examples of how to interpret informal language:
- "most of them" → about 65-75% of class
- "like 30 of them" → approximately 30
- "half the class" → ${Math.round(studentCount / 2)}
- "scatter" (Pidgin) → confused, did not understand
- "dey do am anyhow" → doing it incorrectly without method
- "only few got it" → about 10-20% of class
- "they were lost" → majority did not understand
- "the bright ones got it" → top 15-20% understood

Return:
{
  "cleanedDescription": "Rewrite the teacher's observation in clear English, preserving all the meaning",
  "estimatedAffected": number of students who struggled (integer)
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.2,
  })

  return JSON.parse(response.choices[0].message.content!)
}

// ─── CORE DIAGNOSIS ─────────────────────────────────────────────────────────

export async function diagnose(params: {
  topic: string
  subject: string
  studentCount: number
  teacherDescription: string
  photoAnalysis?: string
  affectedEstimate?: number
}): Promise<any> {
  const { topic, subject, studentCount, teacherDescription, photoAnalysis, affectedEstimate } = params

  const context = [
    teacherDescription ? `Teacher's observation: "${teacherDescription}"` : '',
    photoAnalysis ? `What Koya read from the student's paper:\n${photoAnalysis}` : '',
  ].filter(Boolean).join('\n\n')

  const affected = affectedEstimate ?? Math.round(studentCount * 0.6)
  const correct = studentCount - affected
  const foundation = Math.round(affected * 0.55)
  const core = affected - foundation

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-pro',
    messages: [
      {
        role: 'system',
        content: `You are Koya, an expert AI for African secondary school teachers.

You diagnose the REAL reason students failed — not the surface symptom.
You trace errors back to which specific earlier topic the gap came from.
You speak plainly. No jargon. No vague language.
A teacher reading your output should immediately know what to do next.
Respond only with valid JSON.`,
      },
      {
        role: 'user',
        content: `Topic being taught: ${topic} (${subject})
Total students: ${studentCount}
Estimated students struggling: ${affected}

${context}

Diagnose what is actually blocking these students. Think like this:
- What specific wrong thing are students doing?
- What earlier concept did they never properly learn?
- Which class or term did that concept come from?
- What is the one correction that fixes the most students?

Return this exact JSON:
{
  "headline": "One sharp sentence naming the real problem. Specific, not vague. Example: '${Math.round(affected * 0.85)} students cannot apply the elimination method because they never understood how to add and subtract negative integers in JSS2'",
  "dominant_gap": {
    "label": "Short name for this gap",
    "explanation": "2-3 sentences. What students are doing wrong, why, and the exact earlier topic where this gap started. Be specific about the error pattern.",
    "root_topic": "e.g. JSS2 Term 1 — Integer Operations",
    "affected_count": ${affected}
  },
  "groups": {
    "foundation": {
      "count": ${foundation},
      "description": "What specifically this group cannot do",
      "activity": {
        "title": "Short name",
        "instructions": "Step by step. Teacher reads this aloud or writes on board. Paper only. No devices. Completable in 10 minutes.",
        "duration": "10 mins"
      }
    },
    "core": {
      "count": ${core},
      "description": "What this group partially understands",
      "activity": {
        "title": "Short name",
        "instructions": "Step by step. Paper only. 10 minutes.",
        "duration": "10 mins"
      }
    },
    "advanced": {
      "count": ${correct},
      "description": "What this group is ready for",
      "activity": {
        "title": "Short name",
        "instructions": "Step by step. Paper only. 10 minutes.",
        "duration": "10 mins"
      }
    }
  },
  "tomorrow": "One sentence. The single most important adjustment to make in tomorrow's lesson."
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.25,
  })

  return JSON.parse(response.choices[0].message.content!)
}

// ─── DIAGNOSTIC QUESTION GENERATOR ──────────────────────────────────────────

export async function generateDiagnostic(
  topic: string,
  subject: string,
  context?: string
): Promise<{ questions: DiagnosticQuestion[]; grounded: boolean; source?: string; verified?: boolean }> {
  const entry = lookupCurriculum(topic, subject)

  // Marking standard: if the topic is grounded, build from the verified bank so
  // every answer is hand-checked and correct. No model hallucination in the key.
  if (entry) {
    const verified = buildVerifiedDiagnostic(entry)
    if (verified) {
      return {
        questions: verified,
        grounded: true,
        verified: true,
        source: `${CURRICULUM_SOURCE} (${CURRICULUM_COUNTRY}) · verified question bank`,
      }
    }
  }

  const grounding = entry ? curriculumGrounding(entry) : ''

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: `You are an expert Nigerian secondary school teacher.
You know exactly which prerequisite skills students need before learning a new topic.
You write questions that expose gaps — not questions that test the new topic itself.
Questions must be answerable on paper in under 2 minutes.
Respond only with valid JSON.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}
Subject: ${subject}
${context ? `Context: ${context}` : ''}
${grounding ? `\n${grounding}\n` : ''}
Generate exactly 5 short diagnostic questions.
Each question tests ONE specific prerequisite skill students need BEFORE this topic.
${grounding ? 'Base your questions on the grounded prerequisite skills above, and use the grounded class labels for prerequisite_from.' : 'Identify the genuine prerequisites for this topic from the standard secondary curriculum, and give your best estimate of the class each is taught for prerequisite_from.'}

CRITICAL RULE: Not a single question may require ${topic} itself to answer. If a student who has never been taught ${topic} could not attempt a question, it is wrong, replace it. Every question must come from an EARLIER class or term than ${topic}. The whole point is to find the buried gap underneath ${topic}, not to test ${topic}.
Before returning, check each question: "could a student solve this without knowing ${topic}?" If no, replace it with a genuine prerequisite.

For each question also give the correct answer, so the teacher can mark 50+ papers quickly. Keep the answer short and final (the result, not a full working), e.g. "x = 3" or "12cm²".

Return:
{
  "questions": [
    {
      "question": "The question text — short, clear, answerable on paper",
      "answer": "The correct final answer, short, for the teacher's marking key",
      "skill_tested": "Name of the prerequisite skill",
      "prerequisite_from": "Which class and term this should have been learned e.g. JSS2 Term 1"
    }
  ]
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.4,
  })

  const parsed = JSON.parse(response.choices[0].message.content!) as { questions: DiagnosticQuestion[] }
  return {
    questions: parsed.questions,
    grounded: !!entry,
    source: entry ? `${CURRICULUM_SOURCE} (${CURRICULUM_COUNTRY})` : undefined,
  }
}

// ─── LESSON BRIEF GENERATOR ──────────────────────────────────────────────────

export async function generateLessonBrief(
  topic: string,
  subject: string,
  context?: string
): Promise<LessonBrief> {
  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-pro',
    messages: [
      {
        role: 'system',
        content: `You are an expert Nigerian secondary school teacher preparing another teacher for a lesson.
You know exactly what students typically struggle with and why.
Be specific. Name the exact prerequisite skills. Name the exact errors to watch for.
Respond only with valid JSON.`,
      },
      {
        role: 'user',
        content: `Topic: ${topic}
Subject: ${subject}
${context ? `Context from scheme of work: ${context}` : ''}

Prepare a pre-lesson brief for this teacher.

Return:
{
  "prerequisites": [
    {
      "skill": "Specific skill students need",
      "from_topic": "Which class/term",
      "why_it_matters": "How it connects to this topic"
    }
  ],
  "watch_for": [
    "Specific error pattern to watch for during the lesson"
  ],
  "lesson_flow": [
    {
      "duration": "e.g. 5 mins",
      "action": "What teacher does",
      "note": "Why this matters"
    }
  ],
  "one_warning": "The single most common reason students fail this topic"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  return JSON.parse(response.choices[0].message.content!)
}

// ─── TYPES ───────────────────────────────────────────────────────────────────

export interface DiagnosticQuestion {
  question: string
  answer: string
  skill_tested: string
  prerequisite_from: string
}

export interface LessonBrief {
  prerequisites: { skill: string; from_topic: string; why_it_matters: string }[]
  watch_for: string[]
  lesson_flow: { duration: string; action: string; note: string }[]
  one_warning: string
}
