import { Link } from 'react-router-dom'
import { strings } from '../strings'

/** Paper-craft 404: a torn-corner card that always offers the way home. */
export function NotFound() {
  return (
    <div className="stack">
      <section className="notice notice--torn" aria-labelledby="not-found-heading">
        <p className="eyebrow">404</p>
        <h1 id="not-found-heading">{strings.notFound.heading}</h1>
        <p>{strings.notFound.body}</p>
        <p>
          <Link className="button button--primary" to="/">
            {strings.notFound.cta}
          </Link>
        </p>
      </section>
    </div>
  )
}
