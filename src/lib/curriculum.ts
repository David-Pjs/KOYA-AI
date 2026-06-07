// Curriculum grounding for Koya.
//
// This turns "the model guessed JSS2" into "the NERDC scheme of work lists this
// skill in JSS2." The class/term and prerequisite chains below are taken from the
// Nigerian secondary Mathematics scheme of work (NERDC / UBE 9-year basic
// curriculum and the senior secondary scheme), cross-checked against the JSS2
// and SS scheme-of-work documents we read with MarkItDown.
//
// Source documents (read June 2026):
//  - JSS2 Scheme of Work, FCT Education Resource Centre (NERDC-aligned):
//    Directed Numbers, Simple Equations in One Variable, Expansion of Algebraic
//    Expressions a(b+c), Factorization, Algebraic Fractions, Linear Equations
//    are all listed as JSS2 Mathematics.
//  - Mathematics Scheme of Work SS1-3 (NERDC senior secondary).
//
// When a topic matches here, we feed these documented facts into the prompt and
// tell the model to use them verbatim. When it does not match, the model falls
// back to its own curriculum knowledge (clearly the weaker, "estimate" path).

export interface Prerequisite {
  skill: string
  from: string // class the prerequisite is taught, e.g. "JSS2"
}

export interface CurriculumEntry {
  topic: string
  aliases: string[]
  klass: string // where the topic itself is taught, e.g. "SS2"
  term: string // e.g. "Second Term", or "" when the document does not pin it
  theme: string
  prerequisites: Prerequisite[]
}

export const CURRICULUM_COUNTRY = 'Nigeria'
export const CURRICULUM_SOURCE = 'NERDC / UBE secondary Mathematics scheme of work'

// Focused on the secondary Mathematics spine, with the algebra chain (the
// commonest source of learning debt) grounded most thoroughly.
export const NIGERIA_MATHS: CurriculumEntry[] = [
  {
    topic: 'Simultaneous Linear Equations',
    aliases: ['simultaneous equations', 'simultaneous linear equations', 'elimination', 'substitution method', 'two equations two unknowns'],
    klass: 'SS2',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Solving linear equations in one variable', from: 'JSS2' },
      { skill: 'Operations with directed numbers (positive and negative integers)', from: 'JSS2' },
      { skill: 'Expansion of algebraic expressions, a(b + c)', from: 'JSS2' },
      { skill: 'Substitution of values into algebraic expressions', from: 'JSS2' },
    ],
  },
  {
    topic: 'Quadratic Equations',
    aliases: ['quadratic equation', 'factorising quadratics', 'completing the square', 'quadratic formula'],
    klass: 'SS1',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Factorization of algebraic expressions', from: 'JSS2' },
      { skill: 'Expansion of algebraic expressions', from: 'JSS2' },
      { skill: 'Solving linear equations in one variable', from: 'JSS2' },
      { skill: 'Operations with directed numbers', from: 'JSS2' },
    ],
  },
  {
    topic: 'Change of Subject of Formula',
    aliases: ['change of subject', 'subject of formula', 'rearranging formula', 'transposition'],
    klass: 'SS1',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Solving linear equations in one variable', from: 'JSS2' },
      { skill: 'Operations with directed numbers', from: 'JSS2' },
      { skill: 'Substitution into algebraic expressions', from: 'JSS2' },
    ],
  },
  {
    topic: 'Linear Equations in One Variable',
    aliases: ['linear equation', 'simple equation', 'solving for x', 'equations in one variable'],
    klass: 'JSS2',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Operations with directed numbers (integers)', from: 'JSS2' },
      { skill: 'Use of inverse operations', from: 'JSS2' },
      { skill: 'Basic operations on whole numbers', from: 'JSS1' },
    ],
  },
  {
    topic: 'Expansion of Algebraic Expressions',
    aliases: ['expansion', 'expanding brackets', 'removing brackets', 'a(b+c)'],
    klass: 'JSS2',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Operations with directed numbers', from: 'JSS2' },
      { skill: 'Use of symbols and simple algebraic expressions', from: 'JSS1' },
    ],
  },
  {
    topic: 'Factorization of Algebraic Expressions',
    aliases: ['factorization', 'factorisation', 'common factors', 'factorising'],
    klass: 'JSS2',
    term: 'Second Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Expansion of algebraic expressions', from: 'JSS2' },
      { skill: 'Factors and multiples of whole numbers', from: 'JSS1' },
    ],
  },
  {
    topic: 'Algebraic Fractions',
    aliases: ['algebraic fraction', 'simplifying algebraic fractions'],
    klass: 'JSS2',
    term: 'Third Term',
    theme: 'Algebraic Processes',
    prerequisites: [
      { skill: 'Operations with common fractions', from: 'JSS1' },
      { skill: 'Factorization of algebraic expressions', from: 'JSS2' },
    ],
  },
  {
    topic: 'Directed Numbers and Integers',
    aliases: ['directed numbers', 'integers', 'negative numbers', 'number line'],
    klass: 'JSS2',
    term: 'First Term',
    theme: 'Number and Numeration',
    prerequisites: [
      { skill: 'Basic operations on whole numbers', from: 'JSS1' },
      { skill: 'Place value and the number line', from: 'JSS1' },
    ],
  },
  {
    topic: 'Indices',
    aliases: ['indices', 'laws of indices', 'powers and exponents'],
    klass: 'SS1',
    term: 'First Term',
    theme: 'Number and Numeration',
    prerequisites: [
      { skill: 'Powers of whole numbers and multiplication', from: 'JSS1' },
      { skill: 'Operations with directed numbers', from: 'JSS2' },
    ],
  },
  {
    topic: 'Logarithms',
    aliases: ['logarithm', 'logarithms', 'log tables'],
    klass: 'SS1',
    term: 'First Term',
    theme: 'Number and Numeration',
    prerequisites: [
      { skill: 'Laws of indices', from: 'SS1' },
      { skill: 'Standard form', from: 'JSS3' },
    ],
  },
  {
    topic: 'Mensuration',
    aliases: ['mensuration', 'area and perimeter', 'volume', 'surface area'],
    klass: 'SS1',
    term: 'Third Term',
    theme: 'Mensuration and Geometry',
    prerequisites: [
      { skill: 'Area and perimeter of plane shapes', from: 'JSS2' },
      { skill: 'Substitution into formulae', from: 'JSS2' },
      { skill: 'Operations with fractions and decimals', from: 'JSS1' },
    ],
  },
  {
    topic: 'Trigonometry',
    aliases: ['trigonometry', 'sine cosine tangent', 'trig ratios', 'SOHCAHTOA'],
    klass: 'SS2',
    term: 'First Term',
    theme: 'Mensuration and Geometry',
    prerequisites: [
      { skill: 'Pythagoras theorem', from: 'JSS3' },
      { skill: 'Ratio and proportion', from: 'JSS2' },
      { skill: 'Properties of triangles', from: 'JSS1' },
    ],
  },
  {
    topic: 'Pythagoras Theorem',
    aliases: ['pythagoras', 'pythagoras theorem', 'right angled triangle'],
    klass: 'JSS3',
    term: 'Second Term',
    theme: 'Mensuration and Geometry',
    prerequisites: [
      { skill: 'Squares and square roots', from: 'JSS2' },
      { skill: 'Properties of triangles', from: 'JSS1' },
    ],
  },
  {
    topic: 'Statistics',
    aliases: ['statistics', 'mean median mode', 'measures of central tendency', 'data presentation'],
    klass: 'SS1',
    term: 'Third Term',
    theme: 'Statistics and Probability',
    prerequisites: [
      { skill: 'Collection and presentation of data', from: 'JSS2' },
      { skill: 'Averages of a set of numbers', from: 'JSS2' },
      { skill: 'Operations with decimals', from: 'JSS1' },
    ],
  },
  {
    topic: 'Probability',
    aliases: ['probability', 'chance', 'likelihood'],
    klass: 'SS1',
    term: 'Third Term',
    theme: 'Statistics and Probability',
    prerequisites: [
      { skill: 'Common fractions', from: 'JSS1' },
      { skill: 'Ratio and proportion', from: 'JSS2' },
    ],
  },
]

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()
}

// Match a teacher's free-text topic to a curriculum entry.
// Tries exact topic, then alias containment, then keyword overlap.
export function lookupCurriculum(topic: string, subject: string): CurriculumEntry | null {
  if (!/math/i.test(subject)) return null // only Maths is grounded so far
  const t = normalize(topic)
  if (!t) return null

  for (const entry of NIGERIA_MATHS) {
    if (normalize(entry.topic) === t) return entry
  }
  for (const entry of NIGERIA_MATHS) {
    const names = [entry.topic, ...entry.aliases].map(normalize)
    if (names.some(n => t.includes(n) || n.includes(t))) return entry
  }
  // keyword overlap fallback
  const words = new Set(t.split(' ').filter(w => w.length > 3))
  let best: { entry: CurriculumEntry; score: number } | null = null
  for (const entry of NIGERIA_MATHS) {
    const hay = normalize([entry.topic, ...entry.aliases].join(' '))
    let score = 0
    for (const w of words) if (hay.includes(w)) score++
    if (score > 0 && (!best || score > best.score)) best = { entry, score }
  }
  return best?.entry ?? null
}

// Topics we ground with verified questions and document-backed class labels.
// Surfaced as quick-pick suggestions so teachers land on topics that work best.
export function groundedTopics(subject: string): string[] {
  if (!/math/i.test(subject)) return []
  return [
    'Simultaneous Equations',
    'Quadratic Equations',
    'Change of Subject of Formula',
    'Indices',
    'Logarithms',
    'Trigonometry',
    'Mensuration',
    'Statistics',
    'Probability',
  ]
}

export const COMMON_SUBJECTS = ['Mathematics', 'Physics', 'Chemistry', 'Biology']

// Build a grounding block for the prompt from a matched entry.
export function curriculumGrounding(entry: CurriculumEntry): string {
  const prereqs = entry.prerequisites
    .map(p => `- ${p.skill} — taught in ${p.from}`)
    .join('\n')
  return `GROUNDED CURRICULUM FACTS (${CURRICULUM_COUNTRY}, ${CURRICULUM_SOURCE}):
"${entry.topic}" is taught in ${entry.klass}${entry.term ? ` ${entry.term}` : ''} under the theme ${entry.theme}.
Its documented prerequisite skills, with the class each one is taught, are:
${prereqs}

Use THESE prerequisite skills and THESE exact class labels. Do not invent different class labels; these come from the official scheme of work.`
}
