import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import { course } from '../content/course'
import { courseStats, markCourseCompleted, nextIncompleteLesson, useProgress } from '../progress'
import { strings } from '../strings'
import { CelebrationScreen } from '../components/CelebrationScreen'
import { UnitMap } from '../components/UnitMap'

export function CourseComplete() {
  const progress = useProgress()
  const stats = courseStats(progress)
  const finished = stats.complete

  useEffect(() => {
    if (finished) markCourseCompleted()
  }, [finished])

  if (!finished) {
    const resume = nextIncompleteLesson(progress)
    const remaining = stats.lessons - stats.lessonsComplete
    return (
      <CelebrationScreen
        eyebrow={strings.celebration.lockedEyebrow}
        heading={strings.celebration.courseLockedHeading}
        lead={strings.celebration.courseLockedBody(remaining, stats.lessons)}
        actions={
          resume === null ? null : (
            <Link className="button button--primary" to={`/lesson/${resume}`}>
              {strings.celebration.lockedCta(resume)}
            </Link>
          )
        }
      >
        <section aria-labelledby="course-units-heading">
          <h2 id="course-units-heading">{strings.celebration.reviewUnitsHeading}</h2>
          <UnitMap progress={progress} currentLessonId={resume} />
        </section>
      </CelebrationScreen>
    )
  }

  return (
    <CelebrationScreen
      confetti
      eyebrow={strings.celebration.courseEyebrow}
      heading={strings.celebration.courseHeading}
      lead={strings.celebration.courseLead}
      stats={[
        {
          label: strings.celebration.statsHeading,
          value: strings.celebration.courseFirstTry(stats.firstTryPercent),
        },
        {
          label: strings.quiz.correctedVerdict,
          value: strings.celebration.courseCorrected(stats.corrected),
        },
        {
          label: strings.home.unitMapHeading,
          value: strings.celebration.courseLessons(stats.lessonsComplete, stats.lessons),
        },
      ]}
      actions={
        <>
          <Link className="button button--primary" to={`/unit/${course.units[0].id}/complete`}>
            {strings.unitMap.celebrationLink}
          </Link>
          <Link className="button button--secondary" to="/">
            {strings.celebration.backHome}
          </Link>
        </>
      }
    >
      <section aria-labelledby="course-units-heading">
        <h2 id="course-units-heading">{strings.celebration.reviewUnitsHeading}</h2>
        <UnitMap progress={progress} />
      </section>
    </CelebrationScreen>
  )
}
