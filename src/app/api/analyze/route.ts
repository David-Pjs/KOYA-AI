import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'
import { lookupCurriculum, curriculumGrounding } from '@/lib/curriculum'

const deepseek = new OpenAI({
  apiKey: process.env.DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
})

// v4-pro diagnosis can take ~3 min; give the function room (Vercel default 300s).
export const maxDuration = 300

export async function POST(req: NextRequest) {
  const { topic, subject, studentCount, questions, wrongCounts, paperNotes, groupCounts } = await req.json()

  // Build EXPLICIT wrong / correct lists so the model cannot invent which
  // questions failed. It must reason only over these facts.
  const wrongList = questions
    .map((q: any, i: number) => ({ q, i, wrong: wrongCounts[i] ?? 0 }))
    .filter((x: any) => x.wrong > 0)
    .sort((a: any, b: any) => b.wrong - a.wrong)
  const correctList = questions
    .map((q: any, i: number) => ({ q, i, wrong: wrongCounts[i] ?? 0 }))
    .filter((x: any) => x.wrong === 0)

  const cohort = studentCount === 1 ? 'this student' : `the class of ${studentCount}`
  const cohortShort = studentCount === 1 ? 'this student' : 'the class'

  const wrongBlock = wrongList.length
    ? wrongList.map((x: any) => `- Q${x.i + 1} "${x.q.question}" (tests ${x.q.skill_tested}, ${x.q.prerequisite_from}) — ${x.wrong} of ${studentCount} got it WRONG`).join('\n')
    : '- (none)'
  const correctBlock = correctList.length
    ? correctList.map((x: any) => `- Q${x.i + 1} "${x.q.question}" (tests ${x.q.skill_tested}) — all correct`).join('\n')
    : '- (none)'

  const questionSummary = `QUESTIONS ${cohortShort.toUpperCase()} GOT WRONG (these, and only these, are the failures):
${wrongBlock}

QUESTIONS ANSWERED CORRECTLY (never claim any of these were wrong):
${correctBlock}`

  const entry = lookupCurriculum(topic, subject)
  const grounding = entry ? `\n${curriculumGrounding(entry)}\nWhen you name the root_topic, use one of these documented prerequisite skills and its class label.\n` : ''

  const realErrors = Array.isArray(paperNotes) && paperNotes.length
    ? `\nKoya read the actual marked papers. These are the real mistakes, in the students' own working:\n${paperNotes.map((n: string) => `- ${n}`).join('\n')}\nQuote these concrete mistakes in your explanation and evidence. Do not describe mistakes on questions that were answered correctly.`
    : ''

  // ── Evaluation standard: group sizes are COMPUTED from the data, not invented
  // by the model. The worst-failed prerequisite sets how many share the dominant
  // gap; those split into Foundation (cannot do the basic) and Core (partly can);
  // the rest are Advanced. Deterministic and auditable.
  const counts: number[] = (wrongCounts as number[]).map(n => Math.max(0, Math.min(n, studentCount)))
  const dominantWrong = counts.length ? Math.max(...counts) : 0

  // Photo mode gives REAL per-student grouping (each paper sorted by its own
  // errors). Counts mode has only aggregates, so we estimate the split.
  const realGrouping = groupCounts && typeof groupCounts.foundation === 'number'
  const foundationCount = realGrouping ? groupCounts.foundation : Math.round(dominantWrong * 0.55)
  const coreCount = realGrouping ? groupCounts.core : dominantWrong - foundationCount
  const advancedCount = realGrouping ? groupCounts.advanced : Math.max(0, studentCount - dominantWrong)
  const computedGroups = { foundation: foundationCount, core: coreCount, advanced: advancedCount }
  const affected = realGrouping ? foundationCount + coreCount : dominantWrong
  const readinessScore = studentCount > 0 ? Math.round((advancedCount / studentCount) * 100) : 0

  const response = await deepseek.chat.completions.create({
    model: 'deepseek-v4-flash',
    messages: [
      {
        role: 'system',
        content: 'You are an expert African secondary school teacher analyzing diagnostic results. You identify the root gap behind student errors. Respond only with valid JSON.',
      },
      {
        role: 'user',
        content: `You are diagnosing ${cohort} on the topic "${topic}" (${subject}).

${questionSummary}
${realErrors}
${grounding}

ABSOLUTE RULE: Base everything ONLY on the wrong/correct lists above. Never say a question was wrong if it is in the correct list. Never invent a question. Your headline, explanation, and evidence must be consistent with exactly those failures.

Think like a veteran teacher tracing a problem to its source. Look at which questions were failed and what prerequisite skills they share. The root gap is the single earlier skill that most of the failed questions depend on.

Do this:
1. Identify the dominant misconception — the one root gap that explains the failures above.
2. Show your reasoning: name the specific wrong questions (by number) and the common thread between them. This is evidence a teacher can check against the papers.
3. Explain plainly what ${cohortShort} is doing wrong and the exact earlier class/term the gap comes from. Speak about ${cohortShort} (not "the class" if it is one student).
4. The group sizes are ALREADY COMPUTED from the data (do not change them): Foundation = ${foundationCount}, Core = ${coreCount}, Advanced = ${advancedCount}${realGrouping ? ' (sorted from each student\'s actual paper)' : ''}. Write each group's description and activity to fit these exact numbers. If a group is 0, say so plainly and give no activity for it.
5. Give one paper-based activity per group (10 min, no devices). CRITICAL: the teacher is one person in one room. The Foundation and Advanced activities must be ones students can run on their own, in pairs or silently, WHILE the teacher works directly with another group. State briefly how each runs without her constant attention.

Return this exact JSON:
{
  "headline": "One plain, teacher-facing sentence naming what ${cohortShort} is actually stuck on and why. Do NOT start with a number or a count. Name the skill and the human reason. Speak about ${cohortShort}. e.g. 'They keep collapsing on simultaneous equations because they cannot yet work confidently with negative numbers.'",
  "dominant_gap": {
    "label": "Short name of the gap",
    "explanation": "2-3 sentences: what students get wrong and why",
    "root_topic": "Which earlier class and term this came from",
    "affected_count": number
  },
  "evidence": "1-2 sentences naming the specific questions whose failure rates point to this root gap and the common thread between them. e.g. 'Questions 1 and 4 collapsed (39 and 28 wrong). Both need confident work with negative integers. The questions that did not need integers held up. That is the thread.'",
  "score": number,
  "groups": {
    "foundation": {
      "count": number,
      "description": "What this group struggles with",
      "activity": {
        "title": "Activity name",
        "instructions": "Step by step instructions, written so this group can work in pairs on paper without the teacher hovering",
        "duration": "10 mins",
        "runs": "Short note on how it runs while she teaches another group, e.g. 'Pairs check each other, you are free to work with Core'"
      }
    },
    "core": {
      "count": number,
      "description": "What this group needs",
      "activity": {
        "title": "Activity name",
        "instructions": "Step by step instructions",
        "duration": "10 mins",
        "runs": "How it runs, e.g. 'This is the group you teach directly'"
      }
    },
    "advanced": {
      "count": number,
      "description": "What this group is ready for",
      "activity": {
        "title": "Activity name",
        "instructions": "Step by step instructions for independent work",
        "duration": "10 mins",
        "runs": "How it runs on its own, e.g. 'Fully independent, check at the end'"
      }
    }
  },
  "tomorrow": "One sentence: the single most important change to make in tomorrow's lesson"
}`,
      },
    ],
    response_format: { type: 'json_object' },
    temperature: 0.3,
  })

  const result = JSON.parse(response.choices[0].message.content!)

  // Override with the deterministic, computed numbers so the marks the teacher
  // sees are always consistent with the data, never the model's invention.
  if (result.groups) {
    result.groups.foundation = { ...result.groups.foundation, count: computedGroups.foundation }
    result.groups.core = { ...result.groups.core, count: computedGroups.core }
    result.groups.advanced = { ...result.groups.advanced, count: computedGroups.advanced }
  }
  if (result.dominant_gap) result.dominant_gap.affected_count = affected
  result.score = readinessScore
  result.computed = true
  result.realGrouping = !!realGrouping

  return NextResponse.json(result)
}
