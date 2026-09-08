import { strings } from '../strings'
import type { QuizState } from '../quiz'
import { firstTryCount, openCount } from '../quiz'

interface CorrectionFlowProps {
  state: QuizState
  total: number
}

/**
 * The status banner between checks. Decision 9a: nothing here lets a learner
 * skip a wrong answer — it only tells them what is still open.
 */
export function CorrectionFlow({ state, total }: CorrectionFlowProps) {
  if (state.phase === 'answering') return null

  if (state.phase === 'complete') {
    const firstTry = firstTryCount(state)
    return (
      <div className="correction correction--complete" role="status">
        <p className="correction__heading">{strings.quiz.completeHeading}</p>
        <p className="correction__body">
          {strings.quiz.completeBody(firstTry, total, total - firstTry)}
        </p>
      </div>
    )
  }

  const remaining = openCount(state)
  return (
    <div className="correction" role="status">
      <p className="correction__heading">
        <span className="badge badge--correction">{remaining}</span>{' '}
        {strings.quiz.correctionHeading}
      </p>
      <p className="correction__body">{strings.quiz.correctionBody(remaining)}</p>
    </div>
  )
}
