#!/usr/bin/env node
// Validates content/course.v2.json (the source of truth) and emits the two
// shapes the app consumes:
//   src/content/course.ts        eagerly loaded course/unit/lesson index
//   public/content/lesson-NN.json  lazily fetched full lesson records
// The build fails loudly on any content defect — the bundle is authoritative,
// so a defect there is a build error, never a runtime surprise.

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(root, 'content', 'course.v2.json')
const COURSE_TS = join(root, 'src', 'content', 'course.ts')
const LESSON_DIR = join(root, 'public', 'content')

const errors = []
function check(condition, message) {
  if (!condition) errors.push(message)
}

function nonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function pad(id) {
  return String(id).padStart(2, '0')
}

const bundle = JSON.parse(await readFile(SOURCE, 'utf8'))

// --- top-level shape -------------------------------------------------------
for (const key of ['title', 'subtitle', 'source', 'coverage', 'assessment_convention', 'workflow', 'learning_outcomes', 'units', 'lessons']) {
  check(bundle[key] !== undefined, `bundle is missing top-level key "${key}"`)
}
check(nonEmptyString(bundle.source?.url), 'bundle.source.url is missing')
check(Array.isArray(bundle.units) && bundle.units.length > 0, 'bundle.units must be a non-empty array')
check(Array.isArray(bundle.lessons) && bundle.lessons.length > 0, 'bundle.lessons must be a non-empty array')

const units = Array.isArray(bundle.units) ? bundle.units : []
const lessons = Array.isArray(bundle.lessons) ? bundle.lessons : []

for (const unit of units) {
  const at = `unit ${unit?.id}`
  check(Number.isInteger(unit?.id), `${at}: id must be an integer`)
  check(nonEmptyString(unit?.title), `${at}: title is required`)
  check(Number.isInteger(unit?.first_lesson) && Number.isInteger(unit?.last_lesson), `${at}: first_lesson/last_lesson must be integers`)
  check(unit?.first_lesson <= unit?.last_lesson, `${at}: first_lesson must not exceed last_lesson`)
}

// --- per-lesson gate -------------------------------------------------------
const seenIds = new Set()
for (const lesson of lessons) {
  const at = `lesson ${lesson?.id ?? '(no id)'}`
  check(Number.isInteger(lesson?.id), `${at}: id must be an integer`)
  check(!seenIds.has(lesson?.id), `${at}: duplicate lesson id`)
  seenIds.add(lesson?.id)

  check(nonEmptyString(lesson?.title), `${at}: title is required`)
  check(nonEmptyString(lesson?.objective), `${at}: objective is required`)
  check(nonEmptyString(lesson?.summary), `${at}: summary is required`)
  check(nonEmptyString(lesson?.transcript_excerpt), `${at}: transcript_excerpt is required`)
  check(nonEmptyString(lesson?.duration), `${at}: duration is required`)
  check(nonEmptyString(lesson?.unit), `${at}: unit title is required`)
  check(Number.isFinite(lesson?.duration_seconds), `${at}: duration_seconds must be a number`)
  check(Array.isArray(lesson?.micro_points) && lesson.micro_points.length > 0, `${at}: micro_points must be a non-empty array`)

  const questions = Array.isArray(lesson?.questions) ? lesson.questions : []
  check(questions.length === 5, `${at}: expected exactly 5 questions, found ${questions.length}`)

  const seenQuestionIds = new Set()
  questions.forEach((question, index) => {
    const qat = `${at} question ${index + 1}`
    check(nonEmptyString(question?.id), `${qat}: id is required`)
    check(!seenQuestionIds.has(question?.id), `${qat}: duplicate question id "${question?.id}"`)
    seenQuestionIds.add(question?.id)
    check(nonEmptyString(question?.stem), `${qat}: stem is required`)
    check(nonEmptyString(question?.explanation), `${qat}: explanation is required`)

    const options = Array.isArray(question?.options) ? question.options : []
    check(options.length >= 2, `${qat}: expected at least 2 options, found ${options.length}`)

    const seenLabels = new Set()
    for (const option of options) {
      check(nonEmptyString(option?.label), `${qat}: every option needs a label`)
      check(!seenLabels.has(option?.label), `${qat}: duplicate option label "${option?.label}"`)
      seenLabels.add(option?.label)
      check(nonEmptyString(option?.text), `${qat}: option ${option?.label} needs text`)
      check(typeof option?.is_correct === 'boolean', `${qat}: option ${option?.label} needs a boolean is_correct`)
    }

    const correct = options.filter((option) => option?.is_correct === true)
    check(correct.length === 1, `${qat}: expected exactly one correct option, found ${correct.length}`)
    if (correct.length === 1) {
      check(
        question?.correct_answer === correct[0].label,
        `${qat}: correct_answer "${question?.correct_answer}" does not match the option flagged correct ("${correct[0].label}")`,
      )
    }
  })
}

// every lesson belongs to exactly one unit range, and no unit range is empty
for (const unit of units) {
  for (let id = unit.first_lesson; id <= unit.last_lesson; id += 1) {
    check(seenIds.has(id), `unit ${unit.id} references missing lesson ${id}`)
  }
}
for (const lesson of lessons) {
  const owning = units.filter((unit) => lesson.id >= unit.first_lesson && lesson.id <= unit.last_lesson)
  check(owning.length === 1, `lesson ${lesson.id} belongs to ${owning.length} units, expected exactly 1`)
}

if (errors.length > 0) {
  console.error(`\nContent validation failed with ${errors.length} error(s):`)
  for (const error of errors) console.error(`  - ${error}`)
  console.error('\ncontent/course.v2.json is the source of truth; fix it there.\n')
  process.exit(1)
}

// --- emit ------------------------------------------------------------------
const sortedLessons = [...lessons].sort((a, b) => a.id - b.id)

const index = sortedLessons.map((lesson) => ({
  id: lesson.id,
  title: lesson.title,
  unitId: units.find((unit) => lesson.id >= unit.first_lesson && lesson.id <= unit.last_lesson).id,
  unitTitle: lesson.unit,
  duration: lesson.duration,
  durationSeconds: lesson.duration_seconds,
  objective: lesson.objective,
  start: lesson.start,
  end: lesson.end,
}))

const course = {
  title: bundle.title,
  subtitle: bundle.subtitle,
  assessmentConvention: bundle.assessment_convention,
  learningOutcomes: bundle.learning_outcomes,
  workflow: bundle.workflow,
  source: {
    label: bundle.source.label,
    url: bundle.source.url,
    duration: bundle.source.metadata_duration,
  },
  coverage: {
    start: bundle.coverage.start,
    end: bundle.coverage.end,
    durationSeconds: bundle.coverage.duration_seconds,
  },
  units: units.map((unit) => ({
    id: unit.id,
    title: unit.title,
    firstLesson: unit.first_lesson,
    lastLesson: unit.last_lesson,
  })),
  lessons: index,
}

const courseTs = `// GENERATED by scripts/build-content.mjs — do not edit.
// Source of truth: content/course.v2.json

export interface LessonIndexEntry {
  id: number
  title: string
  unitId: number
  unitTitle: string
  duration: string
  durationSeconds: number
  objective: string
  start: string
  end: string
}

export interface CourseUnit {
  id: number
  title: string
  firstLesson: number
  lastLesson: number
}

export interface Course {
  title: string
  subtitle: string
  assessmentConvention: string
  learningOutcomes: string[]
  workflow: string[]
  source: { label: string; url: string; duration: string }
  coverage: { start: string; end: string; durationSeconds: number }
  units: CourseUnit[]
  lessons: LessonIndexEntry[]
}

export const course: Course = ${JSON.stringify(course, null, 2)} as const

export const lessonById = new Map<number, LessonIndexEntry>(course.lessons.map((lesson) => [lesson.id, lesson]))

export const unitById = new Map<number, CourseUnit>(course.units.map((unit) => [unit.id, unit]))
`

await mkdir(dirname(COURSE_TS), { recursive: true })
await writeFile(COURSE_TS, courseTs, 'utf8')

await rm(LESSON_DIR, { recursive: true, force: true })
await mkdir(LESSON_DIR, { recursive: true })

for (const lesson of sortedLessons) {
  const record = {
    id: lesson.id,
    title: lesson.title,
    unitId: index.find((entry) => entry.id === lesson.id).unitId,
    unitTitle: lesson.unit,
    duration: lesson.duration,
    durationSeconds: lesson.duration_seconds,
    start: lesson.start,
    end: lesson.end,
    objective: lesson.objective,
    microPoints: lesson.micro_points,
    questions: lesson.questions.map((question) => ({
      id: question.id,
      stem: question.stem,
      explanation: question.explanation,
      correctAnswer: question.correct_answer,
      options: question.options.map((option) => ({
        label: option.label,
        text: option.text,
        isCorrect: option.is_correct,
      })),
    })),
    summary: lesson.summary,
    transcriptExcerpt: lesson.transcript_excerpt,
    transcriptBlocks: (lesson.transcript_blocks ?? []).map((block) => ({
      start: block.start,
      end: block.end,
      text: block.text,
    })),
    sourceReference: lesson.source_reference ?? null,
  }
  await writeFile(join(LESSON_DIR, `lesson-${pad(lesson.id)}.json`), `${JSON.stringify(record, null, 2)}\n`, 'utf8')
}

console.log(
  `content ok — ${sortedLessons.length} lessons, ${units.length} units, ` +
    `${sortedLessons.reduce((total, lesson) => total + lesson.questions.length, 0)} questions validated`,
)
console.log(`  wrote src/content/course.ts`)
console.log(`  wrote public/content/lesson-01.json … lesson-${pad(sortedLessons.at(-1).id)}.json`)
