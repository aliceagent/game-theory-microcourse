import { Link, useParams } from 'react-router-dom'
import { seriesBySlug } from '../content/registry'
import { strings } from '../strings'
import { NotFound } from './NotFound'

export function SeriesHome() {
  const slug = useParams().series ?? ''
  const series = seriesBySlug.get(slug)
  if (!series || series.legacy) return <NotFound />

  const live = series.status === 'live'

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">{live ? strings.catalog.statusLive : strings.catalog.statusInProduction}</p>
          <h1>{series.title}</h1>
          <p className="hero__lead">{series.subtitle}</p>
          <p className="meta-line">
            {live ? strings.catalog.lessonCount(series.lessonCount) : strings.catalog.comingSoonBody}
          </p>
          <div className="hero__cta">
            <Link className="button button--secondary" to="/courses">
              {strings.catalog.backToCatalog}
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
