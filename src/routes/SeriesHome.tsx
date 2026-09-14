import { Link, useParams } from 'react-router-dom'
import { seriesBySlug } from '../content/registry'
import { strings } from '../strings'
import { VideoStage } from '../components/VideoStage'
import { buffettPosterSrc, buffettVideoSrc } from '../media'
import { NotFound } from './NotFound'

const LESSONS: { id: number; nOf: string; title: string }[] = [
  { id: 1, nOf: '1/45', title: 'Throw hardballs' },
  { id: 2, nOf: '2/45', title: 'Integrity, intelligence and energy' },
  { id: 3, nOf: '3/45', title: 'Buy ten percent of a classmate' },
  { id: 4, nOf: '4/45', title: 'Short ten percent — a kicker' },
  { id: 5, nOf: '5/45', title: 'Qualities you can choose' },
  { id: 6, nOf: '6/45', title: 'You already own a hundred percent' },
  { id: 7, nOf: '7/45', title: 'Not a macro guy — Japan' },
  { id: 8, nOf: '8/45', title: 'The cigar-butt approach' },
  { id: 9, nOf: '9/45', title: 'Time is the friend of the wonderful business' },
  { id: 10, nOf: '10/45', title: 'The Alaska phone call' },
  { id: 11, nOf: '11/45', title: 'Sixteen high IQs' },
  { id: 12, nOf: '12/45', title: 'Leverage and ruin' },
  { id: 13, nOf: '13/45', title: 'A thousand chambers' },
  { id: 14, nOf: '14/45', title: 'You only have to get rich once' },
  { id: 15, nOf: '15/45', title: "Six-sigma won't save you" },
  { id: 16, nOf: '16/45', title: 'I never borrowed money' },
  { id: 17, nOf: '17/45', title: 'Work in a job you love' },
  { id: 18, nOf: '18/45', title: 'He said I was overpriced' },
  { id: 19, nOf: '19/45', title: 'Businesses I can understand' },
  { id: 20, nOf: '20/45', title: 'A castle with a moat' },
  { id: 21, nOf: '21/45', title: 'Share of mind' },
  { id: 22, nOf: '22/45', title: 'Widen the moat' },
  { id: 23, nOf: '23/45', title: 'Chewing gum in ten years' },
  { id: 24, nOf: '24/45', title: 'A piece of a business' },
  { id: 25, nOf: '25/45', title: 'Not a ticker symbol' },
  { id: 26, nOf: '26/45', title: "See's Candy" },
  { id: 27, nOf: '27/45', title: "See's Candy, getting kissed" },
  { id: 28, nOf: '28/45', title: 'Guilt, guilt, guilt' },
  { id: 29, nOf: '29/45', title: 'Think of Disney' },
  { id: 30, nOf: '30/45', title: "You can't touch it" },
  { id: 31, nOf: '31/45', title: 'If she smiles, the moat widens' },
  { id: 32, nOf: '32/45', title: 'Five or ten minutes' },
  { id: 33, nOf: '33/45', title: 'Circle of competence' },
]

export function SeriesHome() {
  const slug = useParams().series ?? ''
  const series = seriesBySlug.get(slug)
  if (!series || series.legacy) return <NotFound />

  const live = series.status === 'live'
  const playlist = series.playlist

  return (
    <div className="stack">
      <section className="hero">
        <div>
          <p className="eyebrow">{live ? strings.catalog.statusLive : strings.catalog.statusInProduction}</p>
          <h1>{series.title}</h1>
          <p className="hero__lead">{series.subtitle}</p>
          <p className="meta-line">
            {live
              ? strings.catalog.lessonCount(series.lessonCount)
              : `${LESSONS.length} films ready · remaining lessons still rendering`}
          </p>
          {playlist ? (
            <p className="meta-line">
              <a href={playlist.url} rel="noreferrer" target="_blank">
                YouTube playlist — {playlist.title}
              </a>
            </p>
          ) : null}
          <div className="hero__cta">
            <Link className="button button--secondary" to="/courses">
              {strings.catalog.backToCatalog}
            </Link>
          </div>
        </div>
      </section>

      <ol className="list-reset stack">
        {LESSONS.map((lesson) => (
          <li key={lesson.id} className="card">
            <p className="eyebrow">{lesson.nOf}</p>
            <h2>{lesson.title}</h2>
            <VideoStage
              poster={buffettPosterSrc(lesson.id)}
              videoSrc={buffettVideoSrc(lesson.id)}
              aspect="9/16"
            />
          </li>
        ))}
      </ol>
    </div>
  )
}
