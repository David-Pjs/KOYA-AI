# Koya AI

**Find the gap before the exam does.**

A learning-debt diagnostic for the African classroom. One teacher, sixty-something students, chalk and paper, no devices in the room. Koya finds the one hidden prerequisite gap underneath a whole class, traces it to the exact earlier class and term it came from, splits the room into Foundation / Core / Advanced, and hands the teacher one ready-to-run paper activity per group plus the single change to make tomorrow.

Built for the YPIT Artificial Future Hackathon, Education and Skill Building track.

## The loop

1. **Setup.** Subject, class, this week's topic, student count. Optionally upload the scheme of work (PDF or photo); Gemini reads it so questions match the curriculum.
2. **Five board questions.** Each probes a different *prerequisite* the topic secretly depends on, never the topic itself. Designed for paper, designed so a copied answer cannot fake understanding.
3. **Give Koya the marks, two ways.**
   - Enter the wrong-count per question (the room flushes red/amber/green live), or
   - Photograph the marked books and let Gemini read the actual mistakes.
4. **The diagnosis.** Koya names the dominant gap, *shows its reasoning* (which questions point to the root and why), traces it to the source class/term, splits the class, and gives parallel paper activities plus tomorrow's fix.

## Why AI

The hard part is not writing questions. It is reading the failure pattern across five prerequisite skills and tracing it to the single upstream gap that explains the most of it, in seconds, for a teacher with no time. That inference is the product, and it is impossible by hand at sixty-student scale.

## Stack

- Next.js (App Router) + TypeScript
- DeepSeek (`deepseek-chat`) for question generation and diagnosis
- Google Gemini (`gemini-2.0-flash`) for reading scheme-of-work documents and marked papers
- No database; the loop is stateless by design

## Run locally

```bash
npm install
cp .env.example .env.local   # add your DEEPSEEK_API_KEY and GEMINI_API_KEY
npm run dev
```

Open http://localhost:3000.

## Design

Warm scholarly, light theme. Cream paper, deep forest green, terracotta accent. Fraunces for display, Plus Jakarta Sans for body, Caveat reserved for the teacher's pen (circled errors, the Tomorrow note). See `DESIGN.md` and `PRODUCT.md` for the full system and product context.
