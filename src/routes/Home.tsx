import { Link } from 'react-router-dom'
import { course, lessonById } from '../content/course'
import { courseStats, hasAnyProgress, nextIncompleteLesson, useProgress } from '../progress'
import { strings } from '../strings'
import { Disclaimer } from '../components/Disclaimer'
import { SourceCard } from '../components/SourceCard'
import { UnitMap } from '../components/UnitMap'

export function Home() {
  const progress = useProgress()
  const totalMinutes = Math.round(course.coverage.durationSeconds / 60)
  const stats = courseStats(progress)
  const next = nextIncompleteLesson(progress)
  const started = hasAnyProgress(progress)

  // Three states: never started, mid-course, and everything finished.
  const cta =
    next === null
      ? { to: '/complete', label: strings.home.reviewCta, hint: strings.home.reviewCtaHint }
      : started
        ? {
            to: `/lesson/${next}`,
            label: strings.home.continueCta(next),
            hint: strings.home.continueCtaHint(lessonById.get(next)?.title ?? ''),
          }
        : { to: '/lesson/1', label: strings.home.startCta, hint: strings.home.startCtaHint }

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">{strings.home.eyebrow}</p>
          <h1>{course.title}</h1>
          <p className="hero__lead">{course.subtitle}</p>
          <p className="meta-line">{strings.home.estimatedTime(totalMinutes)}</p>
          <div className="hero__cta">
            <Link className="button button--primary" to={cta.to}>
              {cta.label}
            </Link>
            <p className="hero__cta-hint">{cta.hint}</p>
          </div>
          {started ? (
            <p className="meta-line hero__progress">
              {strings.home.courseProgress(stats.lessonsComplete, stats.lessons)}
            </p>
          ) : null}
        </div>

        <div className="stack">
          <figure className="hero__share">
            <img
              src={`${import.meta.env.BASE_URL}share/course.png`}
              width={1200}
              height={630}
              alt="Papercraft pop-up of a child at a marshmallow table while an adult walks toward a doorway."
            />
          </figure>
          <Disclaimer />
          <SourceCard />
        </div>
      </section>

      <section className="card" aria-labelledby="outcomes-heading">
        <h2 id="outcomes-heading">{strings.home.outcomesHeading}</h2>
        <ul className="list-reset outcomes">
          {course.learningOutcomes.map((outcome, index) => (
            <li key={outcome}>
              <span className="outcomes__marker" aria-hidden="true">
                {index + 1}
              </span>
              <span className="measure">{outcome}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card" aria-labelledby="workflow-heading">
        <h2 id="workflow-heading">{strings.home.howItWorksHeading}</h2>
        <ol className="list-reset workflow">
          {course.workflow.map((step, index) => (
            <li key={step}>
              <span className="workflow__marker" aria-hidden="true">
                {index + 1}
              </span>
              <span className="measure">{step}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="unit-map-heading">
        <h2 id="unit-map-heading">{strings.home.unitMapHeading}</h2>
        <p className="meta-line">{strings.home.unitMapNote}</p>
        <div style={{ marginBlockStart: 'var(--space-md)' }}>
          <UnitMap progress={progress} currentLessonId={next} />
        </div>
      </section>
    </div>
  )
}
