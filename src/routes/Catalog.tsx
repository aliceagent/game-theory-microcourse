import { Link } from 'react-router-dom'
import { catalog } from '../content/registry'
import { strings } from '../strings'

export function Catalog() {
  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">{strings.catalog.eyebrow}</p>
          <h1>{catalog.catalogTitle}</h1>
          <p className="hero__lead">{catalog.catalogSubtitle}</p>
        </div>
      </section>

      <ul className="list-reset catalog-grid">
        {catalog.series.map((series) => {
          const to = series.legacy ? '/' : series.basePath
          const live = series.status === 'live'
          return (
            <li key={series.slug}>
              <article className="card catalog-card">
                <p className="eyebrow">
                  {live ? strings.catalog.statusLive : strings.catalog.statusInProduction}
                </p>
                <h2>
                  <Link to={to}>{series.title}</Link>
                </h2>
                <p>{series.subtitle}</p>
                <p className="meta-line">
                  {live
                    ? strings.catalog.lessonCount(series.lessonCount)
                    : strings.catalog.comingSoon}
                </p>
                <p>
                  <Link className="button button--primary" to={to}>
                    {live ? strings.catalog.openCourse : strings.catalog.viewSeries}
                  </Link>
                </p>
              </article>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
