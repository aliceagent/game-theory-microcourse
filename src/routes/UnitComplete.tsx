import { useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import type { CourseUnit } from '../content/course'
import { lessonById, unitById } from '../content/course'
import {
  isLessonComplete,
  markUnitCelebrated,
  nextIncompleteLesson,
  unitLessonIds,
  unitStats,
  useProgress,
} from '../progress'
import { strings } from '../strings'
import { CelebrationScreen } from '../components/CelebrationScreen'
import { NotFound } from './NotFound'

export function UnitComplete() {
  const params = useParams()
  const unit = unitById.get(Number(params.id))

  if (!unit) return <NotFound />
  return <UnitCompleteView key={unit.id} unit={unit} />
}

function UnitCompleteView({ unit }: { unit: CourseUnit }) {
  const progress = useProgress()
  const stats = unitStats(progress, unit)
  const ids = unitLessonIds(unit)
  const finished = stats.complete

  useEffect(() => {
    // Reaching this screen with the unit actually finished is what counts as
    // celebrated — deep-linking an unfinished unit records nothing.
    if (finished) markUnitCelebrated(unit.id)
  }, [unit.id, finished])

  if (!finished) {
    const remaining = ids.filter((id) => !isLessonComplete(progress, id))
    const resume = remaining[0]
    return (
      <CelebrationScreen
        eyebrow={strings.celebration.lockedEyebrow}
        heading={strings.celebration.lockedHeading(unit.id, unit.title)}
        lead={strings.celebration.lockedBody(remaining.length)}
        actions={
          <>
            <Link className="button button--primary" to={`/lesson/${resume}`}>
              {strings.celebration.lockedCta(resume)}
            </Link>
            <Link className="button button--secondary" to="/">
              {strings.celebration.backHome}
            </Link>
          </>
        }
      />
    )
  }

  const next = nextIncompleteLesson(progress)

  return (
    <CelebrationScreen
      confetti
      eyebrow={strings.celebration.unitEyebrow}
      heading={strings.celebration.unitHeading(unit.id, unit.title)}
      lead={strings.celebration.unitLessonsLine(stats.lessons)}
      stats={[
        {
          label: strings.celebration.statsHeading,
          value: strings.celebration.unitScore(stats.firstTryCorrect, stats.questions),
        },
        { label: strings.quiz.correctedVerdict, value: String(stats.corrected) },
      ]}
      actions={
        <>
          {next === null ? (
            <Link className="button button--primary" to="/complete">
              {strings.lesson.courseCompleteCta}
            </Link>
          ) : (
            <Link className="button button--primary" to={`/lesson/${next}`}>
              {strings.celebration.unitNextCta(next)}
            </Link>
          )}
          <Link className="button button--secondary" to="/">
            {strings.celebration.backHome}
          </Link>
        </>
      }
    >
      <section className="card" aria-labelledby="unit-review-heading">
        <h2 id="unit-review-heading">{strings.celebration.unitReviewHeading}</h2>
        <ul className="list-reset review-list">
          {ids.map((id) => (
            <li key={id}>
              <Link to={`/lesson/${id}`}>
                <span className="review-list__number" aria-hidden="true">
                  {id}
                </span>
                <span>{lessonById.get(id)?.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </CelebrationScreen>
  )
}
