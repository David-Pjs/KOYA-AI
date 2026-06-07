// Verified question bank — Koya's marking standard.
//
// Every question here has a hand-checked answer. When a topic is grounded in the
// curriculum map, we build the diagnostic from this bank so the teacher's marking
// key is CORRECT and deterministic, not a model hallucination. The model is only
// used to fill a prerequisite skill that has no bank entry.
//
// Each entry is keyed by a prerequisite skill. Answers verified by hand.

import type { DiagnosticQuestion } from './pipeline'
import type { CurriculumEntry } from './curriculum'

interface BankItem {
  question: string
  answer: string
}

// keyword keys are matched against the curriculum prerequisite skill name.
const BANK: { keys: string[]; items: BankItem[] }[] = [
  {
    keys: ['directed number', 'integer', 'negative number'],
    items: [
      { question: 'Work out: (-7) + 4', answer: '-3' },
      { question: 'Work out: (-5) - (-8)', answer: '3' },
      { question: 'Work out: (-3) × (-6)', answer: '18' },
      { question: 'Work out: (-12) ÷ 4', answer: '-3' },
    ],
  },
  {
    keys: ['linear equation', 'solving for x', 'simple equation', 'equations in one variable'],
    items: [
      { question: 'Solve for x:  x - 4 = -7', answer: 'x = -3' },
      { question: 'Solve for x:  3x = 21', answer: 'x = 7' },
      { question: 'Solve for x:  2x + 5 = 11', answer: 'x = 3' },
      { question: 'Solve for x:  x/2 = 6', answer: 'x = 12' },
    ],
  },
  {
    keys: ['expansion', 'expanding bracket', 'a(b + c)', 'a(b+c)', 'removing bracket'],
    items: [
      { question: 'Expand:  3(x + 4)', answer: '3x + 12' },
      { question: 'Expand:  2(3x - 5)', answer: '6x - 10' },
      { question: 'Expand:  -4(x + 2)', answer: '-4x - 8' },
    ],
  },
  {
    keys: ['substitution', 'substitute'],
    items: [
      { question: 'If x = 3, find the value of 2x + 5', answer: '11' },
      { question: 'If a = 4 and b = -2, find 3a + b', answer: '10' },
      { question: 'If y = 5, find the value of y² - 3', answer: '22' },
    ],
  },
  {
    keys: ['factoriz', 'factoris', 'common factor'],
    items: [
      { question: 'Factorize:  6x + 9', answer: '3(2x + 3)' },
      { question: 'Factorize:  x² + 5x', answer: 'x(x + 5)' },
      { question: 'Factorize:  4a - 8', answer: '4(a - 2)' },
    ],
  },
  {
    keys: ['inverse operation'],
    items: [
      { question: 'Solve using inverse operations:  x + 7 = 10', answer: 'x = 3' },
      { question: 'Solve using inverse operations:  x - 5 = 2', answer: 'x = 7' },
    ],
  },
  {
    keys: ['like term', 'symbols and simple algebraic', 'simple algebraic expression'],
    items: [
      { question: 'Simplify:  5y + 3y - 2y', answer: '6y' },
      { question: 'Simplify:  7a - 10a', answer: '-3a' },
      { question: 'Simplify:  4x + 3 + 2x', answer: '6x + 3' },
    ],
  },
  {
    keys: ['common fraction', 'operations with fraction', 'fractions and decimal'],
    items: [
      { question: 'Work out:  1/2 + 1/4', answer: '3/4' },
      { question: 'Work out:  2/3 × 3/4', answer: '1/2' },
      { question: 'Work out:  3/5 - 1/5', answer: '2/5' },
    ],
  },
  {
    keys: ['whole number', 'basic operation'],
    items: [
      { question: 'Work out:  48 ÷ 6', answer: '8' },
      { question: 'Work out:  7 × 8', answer: '56' },
      { question: 'Work out:  125 - 47', answer: '78' },
    ],
  },
  {
    keys: ['factors and multiple', 'factor', 'multiple'],
    items: [
      { question: 'Find the HCF of 8 and 12', answer: '4' },
      { question: 'Find the LCM of 4 and 6', answer: '12' },
    ],
  },
  {
    keys: ['square', 'square root'],
    items: [
      { question: 'Work out:  7²', answer: '49' },
      { question: 'Work out:  √81', answer: '9' },
    ],
  },
  {
    keys: ['ratio', 'proportion'],
    items: [
      { question: 'Simplify the ratio  8 : 12', answer: '2 : 3' },
      { question: 'Share 20 in the ratio  2 : 3', answer: '8 and 12' },
    ],
  },
  {
    keys: ['indices', 'powers and exponent', 'powers of whole'],
    items: [
      { question: 'Simplify:  x³ × x²', answer: 'x⁵' },
      { question: 'Simplify:  x⁵ ÷ x²', answer: 'x³' },
    ],
  },
  {
    keys: ['standard form'],
    items: [
      { question: 'Write 3400 in standard form', answer: '3.4 × 10³' },
    ],
  },
  {
    keys: ['decimal'],
    items: [
      { question: 'Work out:  0.5 + 0.25', answer: '0.75' },
      { question: 'Work out:  1.2 × 3', answer: '3.6' },
    ],
  },
  {
    keys: ['average', 'mean median', 'central tendency'],
    items: [
      { question: 'Find the mean of  4, 6, 8, 10', answer: '7' },
      { question: 'Find the median of  3, 7, 5, 9, 1', answer: '5' },
    ],
  },
  {
    keys: ['area and perimeter', 'plane shape', 'substitution into formula'],
    items: [
      { question: 'Find the area of a rectangle 5cm by 3cm', answer: '15 cm²' },
      { question: 'Find the perimeter of a square of side 6cm', answer: '24 cm' },
    ],
  },
]

function bankFor(skill: string): BankItem[] | null {
  const s = skill.toLowerCase()
  for (const group of BANK) {
    if (group.keys.some(k => s.includes(k))) return group.items
  }
  return null
}

// pick without repeating questions within a run
function pick(items: BankItem[], used: Set<string>): BankItem | null {
  const free = items.filter(i => !used.has(i.question))
  const pool = free.length ? free : items
  const choice = pool[Math.floor(Math.random() * pool.length)]
  used.add(choice.question)
  return choice
}

// Build 5 verified questions from a grounded topic's prerequisites.
// Returns null if the bank cannot confidently fill all 5 (caller falls back to LLM).
export function buildVerifiedDiagnostic(entry: CurriculumEntry): DiagnosticQuestion[] | null {
  const used = new Set<string>()
  const out: DiagnosticQuestion[] = []

  // one question per prerequisite first
  for (const p of entry.prerequisites) {
    const items = bankFor(p.skill)
    if (!items) continue
    const item = pick(items, used)
    if (item) out.push({ ...item, skill_tested: p.skill, prerequisite_from: p.from })
  }

  // top up to 5 by cycling prerequisites that have more vetted questions
  let guard = 0
  while (out.length < 5 && guard < 30) {
    guard++
    for (const p of entry.prerequisites) {
      if (out.length >= 5) break
      const items = bankFor(p.skill)
      if (!items || items.length === 0) continue
      const item = pick(items, used)
      if (item && !out.some(o => o.question === item.question)) {
        out.push({ ...item, skill_tested: p.skill, prerequisite_from: p.from })
      }
    }
  }

  return out.length >= 5 ? out.slice(0, 5) : null
}
