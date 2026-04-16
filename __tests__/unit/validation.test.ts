import { describe, it, expect } from 'vitest'
import { validateAnswer, hasValidAnswer } from '@/lib/utils/validation'
import type { Question, Answer } from '@/components/test/types'

describe('validateAnswer', () => {
  it('should reject empty multiple choice answer', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'multiple-choice',
      prompt: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 0
    }
    const answer: Answer = { type: 'multiple-choice', value: null }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(false)
    expect(result.error).toBeDefined()
  })

  it('should accept valid multiple choice answer', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'multiple-choice',
      prompt: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 0
    }
    const answer: Answer = { type: 'multiple-choice', value: 0 }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(true)
  })

  it('should reject empty fill-blank answer', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'fill-blank',
      prompt: 'Test ___',
      correctAnswer: 'word'
    }
    const answer: Answer = { type: 'fill-blank', value: '' }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(false)
  })
})

describe('hasValidAnswer', () => {
  it('should return true when all questions have valid answers', () => {
    const questions: Question[] = [
      { id: '1', difficulty: 1, type: 'multiple-choice', prompt: '?', options: ['A', 'B'], correctAnswer: 0 }
    ]
    const answers = new Map([['1', { type: 'multiple-choice', value: 0 }]])

    const result = hasValidAnswer(questions, answers)

    expect(result).toBe(true)
  })

  it('should return false when a question is missing answer', () => {
    const questions: Question[] = [
      { id: '1', difficulty: 1, type: 'multiple-choice', prompt: '?', options: ['A', 'B'], correctAnswer: 0 }
    ]
    const answers = new Map()

    const result = hasValidAnswer(questions, answers)

    expect(result).toBe(false)
  })
})
