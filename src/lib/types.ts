export interface StudentAnswer {
  name: string
  answer: string
}

export interface Malrule {
  id: string
  label: string
  pattern: string
  root_gap: string
  root_topic: string
  correction: string
}

export interface Taxonomy {
  malrules: Malrule[]
}

export interface Classification {
  name: string
  malrule_id: string
  reason: string
}

export interface PatternResult {
  dominant_malrule: Malrule | null
  affected_count: number
  correct_count: number
  total: number
  foundation: number
  core: number
  advanced: number
  breakdown: [string, string[]][]
}

export interface GroupActivity {
  title: string
  instructions: string
  duration: string
}

export interface Activities {
  foundation: GroupActivity
  core: GroupActivity
  advanced: GroupActivity
}

export interface DiagnoseRequest {
  topic: string
  subject: string
  studentAnswers: StudentAnswer[]
}

export interface DiagnoseResponse {
  taxonomy: Taxonomy
  classifications: Classification[]
  pattern: PatternResult
  activities: Activities
}

export interface Prerequisite {
  skill: string
  from_topic: string
  why_it_matters: string
}

export interface LessonStep {
  duration: string
  action: string
  note: string
}

export interface LessonBrief {
  topic: string
  subject: string
  prerequisites: Prerequisite[]
  common_misconceptions: string[]
  lesson_flow: LessonStep[]
  warning: string
}

export interface DiagnosticQuestion {
  question: string
  skill_tested: string
  prerequisite_from: string
}

export interface AppSetup {
  className: string
  subject: string
  topic: string
  studentCount: number
  schemeText?: string
}

export type Screen =
  | 'setup'
  | 'lesson-brief'
  | 'diagnostic'
  | 'results'
  | 'reading'
  | 'diagnosis'
