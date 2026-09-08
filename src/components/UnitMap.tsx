import { Link } from 'react-router-dom'
import { course } from '../content/course'
import type { CourseUnit } from '../content/course'
import type { Progress } from '../progress'
import { lessonState, unitLessonIds, unitStats } from '../progress'
import { strings } from '../strings'

interface UnitMapProps {
  progress: Progress
  /** The lesson the learner is being pointed at, highlighted in the grid. */
  currentLessonId?: number | null
}

/**
 * Every lesson is browsable (decision 22b), so the map is a full grid of 40
 * links — the sequential path is only a recommendation, marked by the
 * "next" highlight rather than by locking anything.
 */
export function UnitMap({ progress, currentLessonId = null }: UnitMapProps) {
  return (
    <div className="unit-map">
      {course.units.map((unit) => (
        <UnitCard
          key={unit.id}
          unit={unit}
          progress={progress}
          currentLessonId={currentLessonId}
        />
      ))}
    </div>
  )
}

interface UnitCardProps {
  unit: CourseUnit
  progress: Progress
  currentLessonId: number | null
}

function UnitCard({ unit, progress, currentLessonId }: UnitCardProps) {
  const ids = unitLessonIds(unit)
  const stats = unitStats(progress, unit)
  const percent = stats.lessons === 0 ? 0 : Math.round((stats.lessonsComplete / stats.lessons) * 100)

  return (
    <article className={`unit-card${stats.complete ? ' unit-card--complete' : ''}`}>
      <p className="unit-card__number">
        {strings.unitMap.unitLabel(unit.id)} · {strings.home.unitLessonRange(unit.firstLesson, unit.lastLesson)}
      </p>
      <p className="unit-card__title">{unit.title}</p>

      <div className="unit-card__progress">
        <div
          className="progress__track"
          role="progressbar"
          aria-label={strings.unitMap.unitProgressLabel(unit.title)}
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div className="progress__fill" style={{ inlineSize: `${percent}%` }} />
        </div>
        <p className="meta-line">{strings.unitMap.progress(stats.lessonsComplete, stats.lessons)}</p>
      </div>

      <ul className="lesson-chips list-reset">
        {ids.map((id) => (
          <li key={id}>
            <LessonChip
              id={id}
              progress={progress}
              current={id === currentLessonId}
            />
          </li>
        ))}
      </ul>

      {stats.complete ? (
        <Link className="unit-card__link" to={`/unit/${unit.id}/complete`}>
          {strings.unitMap.celebrationLink}
        </Link>
      ) : null}
    </article>
  )
}

function LessonChip({
  id,
  progress,
  current,
}: {
  id: number
  progress: Progress
  current: boolean
}) {
  const state = lessonState(progress, id)
  const complete = state === 'complete'
  const started = !complete && state !== 'unseen'
  const title = course.lessons.find((lesson) => lesson.id === id)?.title ?? ''

  const className = [
    'lesson-chip',
    complete ? 'lesson-chip--complete' : '',
    started ? 'lesson-chip--started' : '',
    current ? 'lesson-chip--current' : '',
  ]
    .filter(Boolean)
    .join(' ')

  const stateLabel = complete
    ? strings.unitMap.stateComplete
    : started
      ? strings.unitMap.stateStarted
      : strings.unitMap.stateUnseen

  return (
    <Link
      className={className}
      to={`/lesson/${id}`}
      aria-current={current ? 'page' : undefined}
    >
      <span aria-hidden="true">{id}</span>
      <span className="visually-hidden">
        {strings.unitMap.lessonLinkLabel(id, title)} — {stateLabel}
      </span>
    </Link>
  )
}
