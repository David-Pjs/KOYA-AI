# Koya AI

**Find the gap before the exam does.**

A learning-debt diagnostic for the African classroom. One teacher, sixty-something students, chalk and paper, no devices in the room. Koya finds the one hidden prerequisite gap underneath a whole class, traces it to the exact earlier class and term it came from, splits the room into Foundation / Core / Advanced, and hands the teacher one ready-to-run paper activity per group plus the single change to make tomorrow.

Built for the YPIT Artificial Future Hackathon, Education and Skill Building track.

**Live:** https://koya-ai.vercel.app

## The loop

1. **Setup.** Subject, class, this week's topic, student count. Optionally upload the scheme of work; Koya reads it and lets the teacher pick the topic from what the booklet lists.
2. **Five board questions.** Each probes a different *prerequisite* the topic secretly depends on, never the topic itself. Every question carries a verified answer key, so marking is correct, not guessed.
3. **Give Koya the marks, two ways.**
   - Enter the wrong-count per question (the room flushes red/amber/green live), or
   - Photograph the marked books and let the vision model read each student's actual working.
4. **The diagnosis.** Koya names the dominant gap, *shows its reasoning* (which questions point to the root and why), traces it to the source class/term, sorts each student into Foundation / Core / Advanced, and gives parallel paper activities plus tomorrow's fix.

## Why AI

The hard part is not writing questions. It is reading each student's handwritten working, grading it against the marking key, and tracing the failure pattern to the single upstream gap that explains the most of it, in seconds, for a teacher with no time. That is the product, and it is impossible by hand at sixty-student scale.

## How it works

Two models, each doing what it is best at:

- **DeepSeek V4** (`deepseek-v4-flash`) generates the prerequisite questions and writes the class diagnosis, locked to the graded data so it cannot invent results.
- **Groq Llama 4 Scout** (`meta-llama/llama-4-scout-17b-16e-instruct`) is the vision layer: it reads photographed student papers and scheme photos, grading each answer against the verified key rather than judging blind.
- **Curriculum grounding:** prerequisite class labels (e.g. JSS2) come from the real Nigerian NERDC scheme of work, read with Microsoft MarkItDown into a curriculum map the prompts cite, with a verified question bank for correct answers.
- Digital scheme PDFs are parsed locally with `unpdf` (no vision call needed). No database; the loop is stateless by design.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- DeepSeek V4 for question generation and diagnosis
- Groq (Llama 4 Scout) for reading papers and scheme photos
- `unpdf` for digital PDF text extraction

## Design

Warm scholarly, light theme. Cream paper, deep forest green, terracotta accent. Fraunces for display, Plus Jakarta Sans for body, Caveat reserved for the teacher's pen (circled errors, the Tomorrow note). See `DESIGN.md` and `PRODUCT.md` for the full system and product context.
