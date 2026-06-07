// Koya flow — shared types and API calls for the one diagnostic loop.

export interface ClassSetup {
  subject: string;
  topic: string;
  klass: string; // e.g. "SS2"
  week: string; // e.g. "First Term, Week 9"
  studentCount: number;
  schemeText?: string;
}

export interface Question {
  question: string;
  answer: string;
  skill_tested: string;
  prerequisite_from: string;
}

export interface GroupActivity {
  title: string;
  instructions: string;
  duration: string;
  runs?: string;
}

export interface Group {
  count: number;
  description: string;
  activity: GroupActivity;
}

export interface Diagnosis {
  headline: string;
  dominant_gap: {
    label: string;
    explanation: string;
    root_topic: string;
    affected_count: number;
  };
  evidence?: string;
  score: number;
  groups: { foundation: Group; core: Group; advanced: Group };
  tomorrow: string;
}

function contextLine(s: ClassSetup): string {
  const bits = [s.klass, s.week].filter(Boolean).join(", ");
  return [s.schemeText, bits ? `Class: ${bits}.` : ""].filter(Boolean).join("\n\n");
}

export async function readScheme(photo: File, setup: ClassSetup): Promise<string> {
  const form = new FormData();
  form.append("photo", photo);
  form.append("topic", setup.topic);
  form.append("subject", setup.subject);
  const res = await fetch("/api/read-scheme", { method: "POST", body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.text as string;
}

export async function generateQuestions(setup: ClassSetup): Promise<Question[]> {
  const res = await fetch("/api/diagnostic", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: setup.topic,
      subject: setup.subject,
      context: contextLine(setup) || undefined,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data.questions as Question[];
}

export async function analyzeResults(
  setup: ClassSetup,
  questions: Question[],
  wrongCounts: number[],
  paperNotes?: string[],
): Promise<Diagnosis> {
  const res = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      topic: setup.topic,
      subject: setup.subject,
      studentCount: setup.studentCount,
      questions,
      wrongCounts,
      paperNotes,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as Diagnosis;
}

export interface PaperReadResult {
  sampleSize: number;
  wrongInSample: number[];
  notes: string[];
}

export async function readPapers(
  files: File[],
  setup: ClassSetup,
  questions: Question[],
): Promise<PaperReadResult> {
  const form = new FormData();
  files.forEach(f => form.append("photos", f));
  form.append("topic", setup.topic);
  form.append("subject", setup.subject);
  form.append("questions", JSON.stringify(questions));
  const res = await fetch("/api/read-papers", { method: "POST", body: form });
  const data = await res.json();
  if (data.error) throw new Error(data.error);
  return data as PaperReadResult;
}

// Scale wrong-counts read from a sample of papers up to the whole class.
export function scaleToClass(wrongInSample: number[], sampleSize: number, studentCount: number): number[] {
  if (sampleSize <= 0) return wrongInSample;
  if (sampleSize >= studentCount) return wrongInSample.map(w => Math.min(w, studentCount));
  return wrongInSample.map(w => Math.round((w / sampleSize) * studentCount));
}

export function severityOf(wrong: number, total: number): "crit" | "concern" | "ok" {
  const pct = total > 0 ? wrong / total : 0;
  if (pct >= 0.6) return "crit";
  if (pct >= 0.35) return "concern";
  return "ok";
}
