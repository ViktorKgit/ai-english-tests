import type { Question, Answer } from '@/components/test/types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateAnswer(question: Question, answer: Answer): ValidationResult {
  // First verify answer type matches question type
  if (answer.type !== question.type) {
    return { valid: false, error: 'Answer type does not match question type' }
  }

  switch (question.type) {
    case 'multiple-choice':
      if (answer.value === null || answer.value === undefined) {
        return { valid: false, error: 'Please select an answer' }
      }
      return { valid: true }

    case 'fill-blank':
      if (!answer.value || answer.value.trim() === '') {
        return { valid: false, error: 'Please fill in the blank' }
      }
      return { valid: true }

    case 'matching':
      if (Object.keys(answer.value).length === 0) {
        return { valid: false, error: 'Please match all items' }
      }
      if (Object.keys(answer.value).length !== question.pairs.length) {
        return { valid: false, error: 'Please complete all matches' }
      }
      return { valid: true }

    case 'open-ended':
      if (!answer.value || answer.value.trim() === '') {
        return { valid: false, error: 'Please provide an answer' }
      }
      if (answer.value.trim().length < 3) {
        return { valid: false, error: 'Please provide a more detailed answer' }
      }
      return { valid: true }
  }
}

export function hasValidAnswer(questions: Question[], answers: Map<string, Answer>): boolean {
  for (const question of questions) {
    const answer = answers.get(question.id)
    if (!answer) return false

    const validation = validateAnswer(question, answer)
    if (!validation.valid) return false
  }
  return true
}
