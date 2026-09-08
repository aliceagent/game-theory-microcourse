// Runtime shape of public/content/lesson-NN.json, emitted by
// scripts/build-content.mjs. The build script is the validator, so the loader
// only guards against transport failures, not content defects.

export interface LessonOption {
  label: string
  text: string
  isCorrect: boolean
}

export interface LessonQuestion {
  id: string
  stem: string
  explanation: string
  correctAnswer: string
  options: LessonOption[]
}

export interface TranscriptBlock {
  start: string
  end: string
  text: string
}

export interface LessonRecord {
  id: number
  title: string
  unitId: number
  unitTitle: string
  duration: string
  durationSeconds: number
  start: string
  end: string
  objective: string
  microPoints: string[]
  questions: LessonQuestion[]
  summary: string
  transcriptExcerpt: string
  transcriptBlocks: TranscriptBlock[]
  sourceReference: string | null
}

export function lessonContentUrl(id: number): string {
  return `${import.meta.env.BASE_URL}content/lesson-${String(id).padStart(2, '0')}.json`
}

export async function fetchLesson(id: number, signal?: AbortSignal): Promise<LessonRecord> {
  const response = await fetch(lessonContentUrl(id), { signal })
  if (!response.ok) throw new Error(`lesson ${id} responded ${response.status}`)
  return (await response.json()) as LessonRecord
}
