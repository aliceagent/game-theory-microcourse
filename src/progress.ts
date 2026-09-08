// Progress lives in localStorage only (decision 17a) under the fixed key and
// schema from plan §3. Two rules govern this module:
//
//   1. `version` is written from day one, so a later schema change can migrate
//      instead of guessing what an old payload meant.
//   2. Every read is sanitized field by field. A hand-edited, truncated or
//      foreign value in that key must degrade to a fresh state, never crash the
//      course — so nothing here trusts the parsed JSON's shape.

import { useSyncExternalStore } from 'react'
import { course } from './content/course'
import type { CourseUnit } from './content/course'

export const PROGRESS_KEY = 'gt-course-progress-v1'
export const PROGRESS_VERSION = 1

/** Every lesson carries five questions (200 MCQs across 40 lessons). */
export const QUESTIONS_PER_LESSON = 5

export type LessonState = 'unseen' | 'started' | 'quiz-submitted' | 'correcting' | 'complete'

const LESSON_STATES: readonly LessonState[] = [
  'unseen',
  'started',
  'quiz-submitted',
  'correcting',
  'complete',
]

export interface LessonProgress {
  state: LessonState
  firstTryCorrect: number
  corrected: number
  completedAt: string | null
}

export interface Progress {
  version: typeof PROGRESS_VERSION
  lessons: Record<string, LessonProgress>
  lastVisitedLesson: number | null
  unitsCelebrated: number[]
  courseCompletedAt: string | null
}

const lessonIds = course.lessons.map((lesson) => lesson.id)
const knownLessonIds = new Set(lessonIds)
const knownUnitIds = new Set(course.units.map((unit) => unit.id))

export function freshProgress(): Progress {
  return {
    version: PROGRESS_VERSION,
    lessons: {},
    lastVisitedLesson: null,
    unitsCelebrated: [],
    courseCompletedAt: null,
  }
}

// ---------- sanitizing reads ----------

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

/** Counts are bounded by the question count so a tampered file cannot inflate stats. */
function sanitizeCount(value: unknown): number {
  if (typeof value !== 'number' || !Number.isInteger(value)) return 0
  if (value < 0) return 0
  return Math.min(value, QUESTIONS_PER_LESSON)
}

function sanitizeIsoDate(value: unknown): string | null {
  if (typeof value !== 'string') return null
  return Number.isNaN(Date.parse(value)) ? null : value
}

function sanitizeLessonProgress(value: unknown): LessonProgress | null {
  if (!isRecord(value)) return null
  const state = LESSON_STATES.find((candidate) => candidate === value.state)
  // `unseen` is the absence of a record; storing it would only bloat the value.
  if (!state || state === 'unseen') return null
  return {
    state,
    firstTryCorrect: sanitizeCount(value.firstTryCorrect),
    corrected: sanitizeCount(value.corrected),
    completedAt: sanitizeIsoDate(value.completedAt),
  }
}

function sanitizeLessonId(value: unknown): number | null {
  const id = typeof value === 'string' ? Number(value) : value
  if (typeof id !== 'number' || !Number.isInteger(id)) return null
  return knownLessonIds.has(id) ? id : null
}

/** Returns null when the payload is not a v1 progress object at all. */
function sanitizeProgress(value: unknown): Progress | null {
  if (!isRecord(value)) return null
  if (value.version !== PROGRESS_VERSION) return null

  const clean = freshProgress()

  if (isRecord(value.lessons)) {
    for (const [key, entry] of Object.entries(value.lessons)) {
      const id = sanitizeLessonId(key)
      if (id === null) continue
      const lesson = sanitizeLessonProgress(entry)
      if (lesson) clean.lessons[String(id)] = lesson
    }
  }

  clean.lastVisitedLesson = sanitizeLessonId(value.lastVisitedLesson)

  if (Array.isArray(value.unitsCelebrated)) {
    const units = new Set<number>()
    for (const entry of value.unitsCelebrated) {
      if (typeof entry === 'number' && knownUnitIds.has(entry)) units.add(entry)
    }
    clean.unitsCelebrated = [...units].sort((a, b) => a - b)
  }

  clean.courseCompletedAt = sanitizeIsoDate(value.courseCompletedAt)

  return clean
}

// ---------- storage ----------

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(PROGRESS_KEY)
  } catch {
    // Storage can be disabled entirely (private modes, blocked cookies).
    return null
  }
}

function writeRaw(value: string): void {
  try {
    window.localStorage.setItem(PROGRESS_KEY, value)
  } catch {
    // Falling back to in-memory progress is better than breaking the lesson.
  }
}

function loadFromStorage(): Progress {
  const raw = readRaw()
  if (raw === null) return freshProgress()

  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return repair()
  }

  const clean = sanitizeProgress(parsed)
  if (!clean) return repair()
  return clean
}

/** Overwrite an unreadable value so the next read is clean instead of re-failing. */
function repair(): Progress {
  const fresh = freshProgress()
  writeRaw(JSON.stringify(fresh))
  return fresh
}

// ---------- store ----------

let snapshot: Progress | null = null
let serialized = ''
const listeners = new Set<() => void>()

export function getProgress(): Progress {
  if (snapshot === null) {
    snapshot = loadFromStorage()
    serialized = JSON.stringify(snapshot)
  }
  return snapshot
}

function commit(next: Progress): void {
  const nextSerialized = JSON.stringify(next)
  // Identical writes are dropped so repeated effects cannot loop on re-render.
  if (nextSerialized === serialized) return
  snapshot = next
  serialized = nextSerialized
  writeRaw(nextSerialized)
  for (const listener of listeners) listener()
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useProgress(): Progress {
  return useSyncExternalStore(subscribe, getProgress, getProgress)
}

/** Test/QA hook: drop everything and start over. */
export function resetProgress(): void {
  commit(freshProgress())
}

// ---------- mutations ----------

function lessonEntry(progress: Progress, id: number): LessonProgress {
  return (
    progress.lessons[String(id)] ?? {
      state: 'unseen',
      firstTryCorrect: 0,
      corrected: 0,
      completedAt: null,
    }
  )
}

function withLesson(progress: Progress, id: number, lesson: LessonProgress): Progress {
  return { ...progress, lessons: { ...progress.lessons, [String(id)]: lesson } }
}

export function markLessonVisited(id: number): void {
  if (!knownLessonIds.has(id)) return
  const progress = getProgress()
  const current = lessonEntry(progress, id)
  const next = current.state === 'unseen' ? { ...current, state: 'started' as const } : current
  commit({ ...withLesson(progress, id, next), lastVisitedLesson: id })
}

/**
 * Moves a lesson along the `started → quiz-submitted → correcting` chain.
 * A completed lesson never regresses — replaying its quiz keeps the record of
 * how it was first finished.
 */
export function markLessonState(id: number, state: Exclude<LessonState, 'unseen' | 'complete'>): void {
  if (!knownLessonIds.has(id)) return
  const progress = getProgress()
  const current = lessonEntry(progress, id)
  if (current.state === 'complete' || current.state === state) return
  commit(withLesson(progress, id, { ...current, state }))
}

/**
 * Completion requires every question correct after forced correction (9a), so
 * `firstTryCorrect + corrected` always equals the lesson's question count.
 */
export function markLessonComplete(id: number, firstTryCorrect: number, corrected: number): void {
  if (!knownLessonIds.has(id)) return
  const progress = getProgress()
  const current = lessonEntry(progress, id)
  // Keep the first completion's score; a re-run is practice, not a new record.
  if (current.state === 'complete') return
  commit(
    withLesson(progress, id, {
      state: 'complete',
      firstTryCorrect: sanitizeCount(firstTryCorrect),
      corrected: sanitizeCount(corrected),
      completedAt: new Date().toISOString(),
    }),
  )
}

export function markUnitCelebrated(unitId: number): void {
  if (!knownUnitIds.has(unitId)) return
  const progress = getProgress()
  if (progress.unitsCelebrated.includes(unitId)) return
  commit({
    ...progress,
    unitsCelebrated: [...progress.unitsCelebrated, unitId].sort((a, b) => a - b),
  })
}

export function markCourseCompleted(): void {
  const progress = getProgress()
  if (progress.courseCompletedAt !== null) return
  commit({ ...progress, courseCompletedAt: new Date().toISOString() })
}

// ---------- selectors ----------

export function lessonState(progress: Progress, id: number): LessonState {
  return progress.lessons[String(id)]?.state ?? 'unseen'
}

export function isLessonComplete(progress: Progress, id: number): boolean {
  return lessonState(progress, id) === 'complete'
}

export interface Stats {
  lessons: number
  lessonsComplete: number
  questions: number
  firstTryCorrect: number
  corrected: number
  /** Share of the answered questions that were right first time, 0–100. */
  firstTryPercent: number
  complete: boolean
}

function statsFor(progress: Progress, ids: number[]): Stats {
  let lessonsComplete = 0
  let firstTryCorrect = 0
  let corrected = 0

  for (const id of ids) {
    const entry = progress.lessons[String(id)]
    if (!entry || entry.state !== 'complete') continue
    lessonsComplete += 1
    firstTryCorrect += entry.firstTryCorrect
    corrected += entry.corrected
  }

  const answered = lessonsComplete * QUESTIONS_PER_LESSON
  return {
    lessons: ids.length,
    lessonsComplete,
    questions: ids.length * QUESTIONS_PER_LESSON,
    firstTryCorrect,
    corrected,
    firstTryPercent: answered === 0 ? 0 : Math.round((firstTryCorrect / answered) * 100),
    complete: ids.length > 0 && lessonsComplete === ids.length,
  }
}

export function unitLessonIds(unit: CourseUnit): number[] {
  return lessonIds.filter((id) => id >= unit.firstLesson && id <= unit.lastLesson)
}

export function unitStats(progress: Progress, unit: CourseUnit): Stats {
  return statsFor(progress, unitLessonIds(unit))
}

export function courseStats(progress: Progress): Stats {
  return statsFor(progress, lessonIds)
}

/** The recommended sequential next step: the first lesson not yet complete. */
export function nextIncompleteLesson(progress: Progress, after = 0): number | null {
  return lessonIds.find((id) => id > after && !isLessonComplete(progress, id)) ?? null
}

export function hasAnyProgress(progress: Progress): boolean {
  return Object.keys(progress.lessons).length > 0
}
