import type { LessonQuestion } from '../lesson'
import { strings } from '../strings'

interface ExplanationCardProps {
  question: LessonQuestion
  index: number
}

export function ExplanationCard({ question, index }: ExplanationCardProps) {
  const correct = question.options.find((option) => option.isCorrect)
  return (
    <article className="explanation">
      <p className="meta-line">{strings.quiz.questionLabel(index + 1, 5)}</p>
      <p className="explanation__stem">{question.stem}</p>
      {correct ? (
        <p className="explanation__answer">
          <span>{strings.quiz.answerLabel(correct.label, correct.text)}</span>
        </p>
      ) : null}
      <p className="explanation__why">
        <span className="visually-hidden">{strings.quiz.explanationLabel}: </span>
        {question.explanation}
      </p>
    </article>
  )
}
