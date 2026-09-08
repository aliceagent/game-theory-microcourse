import { useEffect, useReducer, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { lessonById, unitById } from '../content/course'
import type { LessonRecord } from '../lesson'
import { fetchLesson } from '../lesson'
import { posterSrc, videoSrc } from '../media'
import {
  courseStats,
  markLessonComplete,
  markLessonState,
  markLessonVisited,
  unitStats,
  useProgress,
} from '../progress'
import { firstTryCount, initQuiz, quizReducer } from '../quiz'
import { strings } from '../strings'
import { Disclaimer } from '../components/Disclaimer'
import { SourceCard } from '../components/SourceCard'
import { VideoStage } from '../components/VideoStage'
import { QuizGroup } from '../components/QuizGroup'
import { SummaryPanel } from '../components/SummaryPanel'
import { TranscriptDisclosure } from '../components/TranscriptDisclosure'
import { ProgressBar } from '../components/ProgressBar'
import { NotFound } from './NotFound'

type LoadState =
  | { status: 'loading' }
  | { status: 'ready'; lesson: LessonRecord }
  | { status: 'error' }

export function Lesson() {
  const params = useParams()
  const parsed = Number(params.id)
  const id = Number.isInteger(parsed) ? parsed : Number.NaN
  const known = lessonById.get(id)

  if (!known) return <NotFound />
  return <LessonView key={id} id={id} />
}

function LessonView({ id }: { id: number }) {
  const [load, setLoad] = useState<LoadState>({ status: 'loading' })

  useEffect(() => {
    // LessonView is keyed by id, so each lesson gets a fresh instance that
    // already starts in the `loading` state — no reset needed here.
    const controller = new AbortController()
    fetchLesson(id, controller.signal)
      .then((lesson) => setLoad({ status: 'ready', lesson }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        console.error(error)
        setLoad({ status: 'error' })
      })
    return () => controller.abort()
  }, [id])

  useEffect(() => {
    // Visiting counts even if the JSON fails to load — the learner was here.
    markLessonVisited(id)
    window.scrollTo({ top: 0 })
  }, [id])

  if (load.status === 'loading') {
    return (
      <div className="notice" role="status">
        <p>{strings.app.loading}</p>
      </div>
    )
  }

  if (load.status === 'error') {
    return (
      <div className="notice">
        <h1>{strings.lesson.loadErrorHeading}</h1>
        <p>{strings.lesson.loadErrorBody}</p>
        <Link to="/">{strings.app.backToHome}</Link>
      </div>
    )
  }

  return <LessonBody lesson={load.lesson} />
}

function LessonBody({ lesson }: { lesson: LessonRecord }) {
  const [quiz, dispatch] = useReducer(quizReducer, lesson.questions, initQuiz)
  const progress = useProgress()

  const complete = quiz.phase === 'complete'
  const total = lesson.questions.length
  const firstTry = firstTryCount(quiz)
  const resolved = quiz.order.filter((questionId) => quiz.questions[questionId].resolved).length
  // A checked-but-untouched correction round is `quiz-submitted`; picking a new
  // answer for an open question is what makes it `correcting` (plan §3 chain).
  const reworking = quiz.order.some(
    (questionId) =>
      !quiz.questions[questionId].resolved && quiz.questions[questionId].selected !== null,
  )

  useEffect(() => {
    if (complete) {
      markLessonComplete(lesson.id, firstTry, total - firstTry)
      return
    }
    if (quiz.submissions === 0) return
    markLessonState(lesson.id, reworking ? 'correcting' : 'quiz-submitted')
  }, [lesson.id, complete, firstTry, total, quiz.submissions, reworking])

  const unit = unitById.get(lesson.unitId)
  const unitProgress = unit ? unitStats(progress, unit) : null
  const unitCelebrated = unit ? progress.unitsCelebrated.includes(unit.id) : false
  const stats = courseStats(progress)

  const prev = lessonById.get(lesson.id - 1)
  const next = lessonById.get(lesson.id + 1)

  const stateLabel = complete
    ? strings.progress.stateComplete
    : quiz.phase === 'correcting'
      ? strings.progress.stateCorrecting
      : strings.progress.stateAnswering

  // Finishing the last outstanding lesson of a unit sends the learner through
  // that unit's celebration screen before the next lesson (plan §6, sprint 2).
  const forward =
    complete && unit && unitProgress?.complete && !unitCelebrated
      ? { to: `/unit/${unit.id}/complete`, label: strings.lesson.unitCompleteCta(unit.id) }
      : complete && next
        ? { to: `/lesson/${next.id}`, label: strings.lesson.nextCta(next.id) }
        : complete
          ? { to: '/complete', label: strings.lesson.courseCompleteCta }
          : null

  return (
    <div className="stack">
      <header className="lesson-head">
        <p className="eyebrow">{strings.lesson.breadcrumb(lesson.unitTitle, lesson.id)}</p>
        <h1>{lesson.title}</h1>
        <div className="lesson-head__meta">
          <span>{strings.lesson.durationLabel(lesson.duration)}</span>
          <span>{strings.lesson.windowLabel(lesson.start, lesson.end)}</span>
          {lesson.sourceReference ? <span>{lesson.sourceReference}</span> : null}
        </div>
        <p className="lesson-head__objective">{lesson.objective}</p>
      </header>

      <Disclaimer />

      <VideoStage poster={posterSrc(lesson.id)} videoSrc={videoSrc(lesson.id)} />

      <ProgressBar value={resolved} max={total} stateLabel={stateLabel} />

      <section className="card" aria-labelledby="points-heading">
        <h2 id="points-heading">{strings.lesson.keyPointsHeading}</h2>
        <ul className="list-reset points">
          {lesson.microPoints.map((point) => (
            <li key={point}>
              <span className="points__dot" aria-hidden="true" />
              <span>{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <QuizGroup questions={lesson.questions} state={quiz} dispatch={dispatch} />

      <SummaryPanel summary={lesson.summary} unlocked={complete} />

      <TranscriptDisclosure blocks={lesson.transcriptBlocks} excerpt={lesson.transcriptExcerpt} />

      <SourceCard />

      {forward ? (
        <div className="lesson-forward reveal">
          <Link className="button button--primary" to={forward.to}>
            {forward.label}
          </Link>
        </div>
      ) : null}

      <footer className="lesson-footer">
        <h2 className="visually-hidden">{strings.lesson.footerHeading}</h2>
        <nav className="lesson-nav" aria-label={strings.lesson.navLabel}>
          {prev ? (
            <Link className="lesson-nav__link lesson-nav__link--prev" to={`/lesson/${prev.id}`}>
              <span className="lesson-nav__direction">{strings.lesson.prevLabel}</span>
              <span className="lesson-nav__title">{strings.lesson.prev(prev.id)} · {prev.title}</span>
            </Link>
          ) : (
            <Link className="lesson-nav__link lesson-nav__link--prev" to="/">
              <span className="lesson-nav__direction">{strings.lesson.prevLabel}</span>
              <span className="lesson-nav__title">{strings.app.backToHome}</span>
            </Link>
          )}
          {next ? (
            <Link className="lesson-nav__link lesson-nav__link--next" to={`/lesson/${next.id}`}>
              <span className="lesson-nav__direction">{strings.lesson.nextLabel}</span>
              <span className="lesson-nav__title">{strings.lesson.next(next.id)} · {next.title}</span>
            </Link>
          ) : (
            <Link className="lesson-nav__link lesson-nav__link--next" to="/complete">
              <span className="lesson-nav__direction">{strings.lesson.nextLabel}</span>
              <span className="lesson-nav__title">{strings.celebration.courseHeading}</span>
            </Link>
          )}
        </nav>

        <p className="meta-line lesson-footer__stats">
          {strings.lesson.footerCourseProgress(stats.lessonsComplete, stats.lessons)}
          {unit && unitProgress
            ? ` · ${strings.lesson.footerUnitProgress(
                unit.title,
                unitProgress.lessonsComplete,
                unitProgress.lessons,
              )}`
            : null}
        </p>
      </footer>
    </div>
  )
}
