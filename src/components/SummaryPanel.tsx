import { strings } from '../strings'

interface SummaryPanelProps {
  summary: string
  /** The summary reveals only after forced correction finishes (decision 9a). */
  unlocked: boolean
}

export function SummaryPanel({ summary, unlocked }: SummaryPanelProps) {
  if (!unlocked) {
    return (
      <section className="card card--quiet" aria-labelledby="summary-heading">
        <h2 id="summary-heading">{strings.summary.lockedHeading}</h2>
        <p className="summary__body summary--locked">{strings.summary.lockedBody}</p>
      </section>
    )
  }

  return (
    <section className="card reveal" aria-labelledby="summary-heading">
      <h2 id="summary-heading">{strings.summary.heading}</h2>
      <p className="summary__body">{summary}</p>
    </section>
  )
}
