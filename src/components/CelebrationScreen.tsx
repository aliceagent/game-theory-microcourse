import type { ReactNode } from 'react'
import { strings } from '../strings'

export interface CelebrationStat {
  label: string
  value: string
}

interface CelebrationScreenProps {
  eyebrow: string
  heading: string
  lead?: string
  stats?: CelebrationStat[]
  /** Paper scraps; CSS hides them entirely under prefers-reduced-motion. */
  confetti?: boolean
  actions?: ReactNode
  children?: ReactNode
}

// Deterministic scatter — no randomness, so the screen looks identical on every
// visit and in every screenshot the QA harness takes.
const SCRAPS = [
  { left: 6, delay: 0, tilt: -18, tone: 'a' },
  { left: 17, delay: 240, tilt: 12, tone: 'b' },
  { left: 28, delay: 90, tilt: 32, tone: 'c' },
  { left: 39, delay: 380, tilt: -8, tone: 'a' },
  { left: 50, delay: 160, tilt: 24, tone: 'b' },
  { left: 61, delay: 300, tilt: -28, tone: 'c' },
  { left: 72, delay: 60, tilt: 16, tone: 'a' },
  { left: 83, delay: 420, tilt: -14, tone: 'b' },
  { left: 94, delay: 200, tilt: 28, tone: 'c' },
]

export function CelebrationScreen({
  eyebrow,
  heading,
  lead,
  stats,
  confetti = false,
  actions,
  children,
}: CelebrationScreenProps) {
  return (
    <div className="stack">
      <section className="celebration" aria-labelledby="celebration-heading">
        {confetti ? (
          <div className="confetti" aria-hidden="true">
            {SCRAPS.map((scrap) => (
              <span
                key={scrap.left}
                className={`confetti__scrap confetti__scrap--${scrap.tone}`}
                style={{
                  insetInlineStart: `${scrap.left}%`,
                  animationDelay: `${scrap.delay}ms`,
                  rotate: `${scrap.tilt}deg`,
                }}
              />
            ))}
          </div>
        ) : null}

        <div className="celebration__body">
          <p className="eyebrow">{eyebrow}</p>
          <h1 id="celebration-heading">{heading}</h1>
          {lead ? <p className="celebration__lead">{lead}</p> : null}

          {stats && stats.length > 0 ? (
            <dl className="celebration__stats">
              {stats.map((stat) => (
                <div className="celebration__stat" key={stat.label}>
                  <dt>{stat.label}</dt>
                  <dd>{stat.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}

          {actions ? <div className="celebration__actions">{actions}</div> : null}
          <p className="celebration__note">{strings.celebration.shareNote}</p>
        </div>
      </section>

      {children}
    </div>
  )
}
