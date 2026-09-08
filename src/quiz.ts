// One shared quiz reducer for every lesson. Forced correction (decision 9a):
// a lesson only reaches `complete` when all five questions are answered
// correctly, and a wrong choice is struck out and disabled rather than reset,
// so the learner must pick a different answer.

import type { LessonQuestion } from './lesson'

export type QuizPhase = 'answering' | 'correcting' | 'complete'

export interface QuestionState {
  /** Currently chosen option label, or null when nothing is chosen yet. */
  selected: string | null
  /** True once this question has been answered correctly. */
  resolved: boolean
  /** Labels already tried and confirmed wrong; disabled from here on. */
  rejected: string[]
  /** True when it was resolved on the very first check. */
  firstTry: boolean
}

export interface QuizState {
  phase: QuizPhase
  /** Keyed by question id, in the order the questions appear. */
  questions: Record<string, QuestionState>
  order: string[]
  submissions: number
}

export type QuizAction =
  | { type: 'select'; questionId: string; label: string }
  | { type: 'submit'; questions: LessonQuestion[] }
  | { type: 'reset'; questions: LessonQuestion[] }

export function initQuiz(questions: LessonQuestion[]): QuizState {
  const state: QuizState = { phase: 'answering', questions: {}, order: [], submissions: 0 }
  for (const question of questions) {
    state.order.push(question.id)
    state.questions[question.id] = { selected: null, resolved: false, rejected: [], firstTry: false }
  }
  return state
}

export function quizReducer(state: QuizState, action: QuizAction): QuizState {
  switch (action.type) {
    case 'reset':
      return initQuiz(action.questions)

    case 'select': {
      const current = state.questions[action.questionId]
      if (!current || current.resolved || state.phase === 'complete') return state
      if (current.rejected.includes(action.label)) return state
      if (current.selected === action.label) return state
      return {
        ...state,
        questions: { ...state.questions, [action.questionId]: { ...current, selected: action.label } },
      }
    }

    case 'submit': {
      if (state.phase === 'complete') return state
      if (!isSubmittable(state)) return state

      const firstCheck = state.submissions === 0
      const questions: Record<string, QuestionState> = {}
      let openCount = 0

      for (const question of action.questions) {
        const current = state.questions[question.id]
        if (!current) continue
        if (current.resolved) {
          questions[question.id] = current
          continue
        }
        const chosen = question.options.find((option) => option.label === current.selected)
        if (chosen?.isCorrect) {
          questions[question.id] = { ...current, resolved: true, firstTry: firstCheck }
        } else {
          openCount += 1
          questions[question.id] = {
            ...current,
            selected: null,
            rejected: current.selected ? [...current.rejected, current.selected] : current.rejected,
          }
        }
      }

      return {
        ...state,
        questions,
        submissions: state.submissions + 1,
        phase: openCount === 0 ? 'complete' : 'correcting',
      }
    }

    default:
      return state
  }
}

/** Every still-open question needs a fresh selection before a check is allowed. */
export function isSubmittable(state: QuizState): boolean {
  return state.order.every((id) => {
    const question = state.questions[id]
    return question.resolved || question.selected !== null
  })
}

export function answeredCount(state: QuizState): number {
  return state.order.filter((id) => {
    const question = state.questions[id]
    return question.resolved || question.selected !== null
  }).length
}

export function openCount(state: QuizState): number {
  return state.order.filter((id) => !state.questions[id].resolved).length
}

export function firstTryCount(state: QuizState): number {
  return state.order.filter((id) => state.questions[id].firstTry).length
}
