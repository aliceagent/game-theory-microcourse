import { strings } from '../strings'

interface ProgressBarProps {
  value: number
  max: number
  stateLabel: string
}

export function ProgressBar({ value, max, stateLabel }: ProgressBarProps) {
  const percent = max === 0 ? 0 : Math.round((value / max) * 100)
  return (
    <div className="progress">
      <div className="progress__meta">
        <span>{stateLabel}</span>
        <span>{strings.progress.percent(percent)}</span>
      </div>
      <div
        className="progress__track"
        role="progressbar"
        aria-label={strings.progress.label}
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="progress__fill" style={{ inlineSize: `${percent}%` }} />
      </div>
    </div>
  )
}
