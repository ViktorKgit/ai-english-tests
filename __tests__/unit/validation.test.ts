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

  it('should accept valid fill-blank answer', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'fill-blank',
      prompt: 'Test ___',
      correctAnswer: 'word'
    }
    const answer: Answer = { type: 'fill-blank', value: 'test' }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(true)
  })

  it('should reject incomplete matching answers', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'matching',
      pairs: [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' }
      ]
    }
    const answer: Answer = { type: 'matching', value: { 'A': '1' } }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(false)
  })

  it('should accept valid matching answers', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'matching',
      pairs: [
        { left: 'A', right: '1' },
        { left: 'B', right: '2' }
      ]
    }
    const answer: Answer = { type: 'matching', value: { 'A': '1', 'B': '2' } }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(true)
  })

  it('should reject too short open-ended answers', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'open-ended',
      prompt: 'Explain...',
      correctAnswer: ['answer']
    }
    const answer: Answer = { type: 'open-ended', value: 'ab' }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(false)
  })

  it('should accept valid open-ended answers', () => {
    const question: Question = {
      id: '1',
      difficulty: 1,
      type: 'open-ended',
      prompt: 'Explain...',
      correctAnswer: ['answer']
    }
    const answer: Answer = { type: 'open-ended', value: 'This is a valid answer' }

    const result = validateAnswer(question, answer)

    expect(result.valid).toBe(true)
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
