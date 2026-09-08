import type { Dispatch } from 'react'
import type { LessonQuestion } from '../lesson'
import type { QuizAction, QuizState } from '../quiz'
import { answeredCount, isSubmittable } from '../quiz'
import { course } from '../content/course'
import { strings } from '../strings'
import { CorrectionFlow } from './CorrectionFlow'
import { ExplanationCard } from './ExplanationCard'

interface QuizGroupProps {
  questions: LessonQuestion[]
  state: QuizState
  dispatch: Dispatch<QuizAction>
}

export function QuizGroup({ questions, state, dispatch }: QuizGroupProps) {
  const total = questions.length
  const complete = state.phase === 'complete'
  const submittable = isSubmittable(state)
  const answered = answeredCount(state)

  return (
    <section className="quiz" aria-labelledby="quiz-heading">
      <div>
        <h2 id="quiz-heading">{strings.quiz.heading}</h2>
        <p className="quiz__convention">{course.assessmentConvention}</p>
      </div>

      {questions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          index={index}
          total={total}
          state={state}
          dispatch={dispatch}
        />
      ))}

      <CorrectionFlow state={state} total={total} />

      {complete ? null : (
        <div className="quiz__actions">
          <button
            type="button"
            className="button button--primary"
            disabled={!submittable}
            onClick={() => dispatch({ type: 'submit', questions })}
          >
            {state.phase === 'answering' ? strings.quiz.submit : strings.quiz.resubmit}
          </button>
          {submittable ? (
            <p className="quiz__hint">{strings.quiz.answeredCount(answered, total)}</p>
          ) : (
            <p className="quiz__hint">
              {state.phase === 'answering'
                ? strings.quiz.submitBlockedHint
                : strings.quiz.resubmitBlockedHint}
            </p>
          )}
        </div>
      )}

      {complete ? (
        <section className="reveal" aria-labelledby="explanations-heading">
          <h2 id="explanations-heading">{strings.quiz.explanationsHeading}</h2>
          <div className="explanations">
            {questions.map((question, index) => (
              <ExplanationCard key={question.id} question={question} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </section>
  )
}

interface QuestionCardProps {
  question: LessonQuestion
  index: number
  total: number
  state: QuizState
  dispatch: Dispatch<QuizAction>
}

function QuestionCard({ question, index, total, state, dispatch }: QuestionCardProps) {
  const questionState = state.questions[question.id]
  const checked = state.submissions > 0
  const resolved = questionState.resolved
  const open = checked && !resolved

  const className = ['question', resolved ? 'question--resolved' : '', open ? 'question--open' : '']
    .filter(Boolean)
    .join(' ')

  return (
    <fieldset className={className} disabled={resolved}>
      <legend className="question__legend">{strings.quiz.questionLabel(index + 1, total)}</legend>
      <p className="question__stem">{question.stem}</p>
      <div className="options" role="group">
        {question.options.map((option) => {
          const rejected = questionState.rejected.includes(option.label)
          const selected = questionState.selected === option.label
          const isTheAnswer = resolved && option.isCorrect
          const optionClass = [
            'option',
            selected && !resolved ? 'option--selected' : '',
            isTheAnswer ? 'option--correct' : '',
            rejected ? 'option--rejected' : '',
          ]
            .filter(Boolean)
            .join(' ')

          return (
            <button
              key={option.label}
              type="button"
              className={optionClass}
              aria-pressed={selected || isTheAnswer}
              disabled={resolved || rejected}
              onClick={() => dispatch({ type: 'select', questionId: question.id, label: option.label })}
            >
              <span className="option__chip" aria-hidden="true">
                {option.label}
              </span>
              <span>
                {option.text}
                {rejected ? (
                  <span className="visually-hidden"> — {strings.quiz.previousChoiceLabel}</span>
                ) : null}
              </span>
            </button>
          )
        })}
      </div>

      {resolved ? (
        <p className="verdict verdict--correct">
          {questionState.firstTry ? strings.quiz.correctVerdict : strings.quiz.correctedVerdict}
        </p>
      ) : null}
      {open ? <p className="verdict verdict--incorrect">{strings.quiz.incorrectVerdict}</p> : null}
    </fieldset>
  )
}
