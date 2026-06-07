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

  const questionSummary = questions.map((q: any, i: number) => (
    `Q${i + 1}: "${q.question}" (tests: ${q.skill_tested}, from ${q.prerequisite_from}) — ${wrongCounts[i]} of ${studentCount} students wrong`
  )).join('\n')

  const entry = lookupCurriculum(topic, subject)
  const grounding = entry ? `\n${curriculumGrounding(entry)}\nWhen you name the root_topic, use one of these documented prerequisite skills and its class label.\n` : ''

  const realErrors = Array.isArray(paperNotes) && paperNotes.length
    ? `\nKoya read the actual marked papers. These are real mistakes students made, in their own working:\n${paperNotes.map((n: string) => `- ${n}`).join('\n')}\nUse these concrete errors in your explanation and especially in the evidence, quoting the kind of mistake you saw.`
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
        content: `Topic being taught: ${topic} (${subject})
Class size: ${studentCount} students

Diagnostic results:
${questionSummary}
${realErrors}
${grounding}

Think like a veteran teacher tracing a problem to its source. The five questions each test a different prerequisite skill. Look at WHICH questions had the highest wrong-counts and what those skills have in common. The root gap is the single earlier skill that most of the failed questions secretly depend on.

Do this:
1. Identify the dominant misconception — the one root gap that explains the most failures across the questions.
2. Show your reasoning: name the specific questions (by number and skill) whose high failure rates point to this gap, and the common thread between them. This is the evidence a teacher can check.
3. Explain plainly what students are doing wrong and the exact earlier class/term the gap comes from.
4. The group sizes are ALREADY COMPUTED from the data (do not change them): Foundation = ${foundationCount}, Core = ${coreCount}, Advanced = ${advancedCount}${realGrouping ? ' (sorted from each student\'s actual paper)' : ''}. Write each group's description and activity to fit these exact numbers. If a group is 0, say so plainly and give no activity for it.
5. Give one paper-based activity per group (10 min, no devices). CRITICAL: the teacher is one person in one room. The Foundation and Advanced activities must be ones students can run on their own, in pairs or silently, WHILE the teacher works directly with another group. State briefly how each runs without her constant attention.

Return this exact JSON:
{
  "headline": "One plain, teacher-facing sentence naming what the class is actually stuck on and why. Do NOT start with a number or a count. Name the skill and the human reason. e.g. 'The class keeps collapsing on simultaneous equations because they cannot yet work confidently with negative numbers.'",
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
