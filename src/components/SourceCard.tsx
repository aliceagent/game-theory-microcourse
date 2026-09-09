import { course } from '../content/course'
import { strings } from '../strings'

/**
 * Decision 13b, resolved in plan §2.4: a styled static citation card, not the
 * X embed widget. No third-party script, no re-hosted original lecture.
 * Jonathan 2026-09-09: also link the YouTube playlist next to the X post.
 */
export function SourceCard() {
  return (
    <aside className="source-card">
      <div className="source-card__body">
        <p className="source-card__heading">{strings.source.heading}</p>
        <p className="meta-line">{strings.source.body}</p>
        <p className="source-card__note">{strings.source.note}</p>
      </div>
      <div className="source-card__links">
        <a
          className="button button--secondary"
          href={course.source.url}
          target="_blank"
          rel="noreferrer noopener"
        >
          {strings.source.linkLabel}
        </a>
        <a
          className="button button--secondary"
          href={strings.source.playlistUrl}
          target="_blank"
          rel="noreferrer noopener"
        >
          {strings.source.playlistLabel}
        </a>
      </div>
    </aside>
  )
}
