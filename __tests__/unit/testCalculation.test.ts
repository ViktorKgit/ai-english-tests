import { describe, it, expect } from 'vitest'
import { calculateLevelTestScore, determinePlacementLevel, getRandomQuestions, checkLevelPassThreshold } from '@/lib/utils/testCalculation'
import type { Question, Answer } from '@/components/test/types'

describe('calculateLevelTestScore', () => {
  it('should calculate 100% score for all correct answers', () => {
    const questions: Question[] = [
      { id: '1', difficulty: 1, type: 'multiple-choice', prompt: '', options: ['a', 'b'], correctAnswer: 0 },
      { id: '2', difficulty: 1, type: 'multiple-choice', prompt: '', options: ['a', 'b'], correctAnswer: 1 },
    ]
    const answers = new Map<string, Answer>([
      ['1', { type: 'multiple-choice', value: 0 }],
      ['2', { type: 'multiple-choice', value: 1 }],
    ])

    const result = calculateLevelTestScore(questions, answers)

    expect(result.score).toBe(100)
    expect(result.passed).toBe(true)
  })

  it('should calculate 50% score for half correct', () => {
    const questions: Question[] = [
      { id: '1', difficulty: 1, type: 'multiple-choice', prompt: '', options: ['a', 'b'], correctAnswer: 0 },
      { id: '2', difficulty: 1, type: 'multiple-choice', prompt: '', options: ['a', 'b'], correctAnswer: 1 },
    ]
    const answers = new Map<string, Answer>([
      ['1', { type: 'multiple-choice', value: 0 }],
      ['2', { type: 'multiple-choice', value: 0 }],
    ])

    const result = calculateLevelTestScore(questions, answers)

    expect(result.score).toBe(50)
    expect(result.passed).toBe(false)
  })
})

describe('determinePlacementLevel', () => {
  it('should return A0-A1 for mostly incorrect A2-level answers', () => {
    const result = determinePlacementLevel([
      { questionId: '1', correct: false, difficulty: 3 },
      { questionId: '2', correct: false, difficulty: 3 },
      { questionId: '3', correct: true, difficulty: 3 },
    ])

    expect(result).toBe('A1')
  })

  it('should return B1 for mostly correct B1-level answers', () => {
    const result = determinePlacementLevel([
      { questionId: '1', correct: true, difficulty: 4 },
      { questionId: '2', correct: true, difficulty: 4 },
      { questionId: '3', correct: true, difficulty: 4 },
      { questionId: '4', correct: false, difficulty: 4 },
    ])

    expect(result).toBe('B1')
  })
})

describe('getRandomQuestions', () => {
  it('should return specified count of questions', () => {
    const questions = [
      { id: '1' }, { id: '2' }, { id: '3' },
      { id: '4' }, { id: '5' }
    ]
    const result = getRandomQuestions(questions, 3)

    expect(result).toHaveLength(3)
  })

  it('should not return duplicate questions', () => {
    const questions = [
      { id: '1' }, { id: '2' }, { id: '3' }
    ]
    const result = getRandomQuestions(questions, 3)

    const ids = result.map(q => q.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should handle count larger than array length', () => {
    const questions = [{ id: '1' }, { id: '2' }]
    const result = getRandomQuestions(questions, 5)

    expect(result).toHaveLength(2)
  })
})

describe('checkLevelPassThreshold', () => {
  it('should return true for 70% (7 of 10)', () => {
    const questions = Array(10).fill(null).map((_, i) => ({
      id: `q${i}`,
      difficulty: 1,
      type: 'multiple-choice' as const,
      prompt: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 0
    }))
    const answers = new Map(
      questions.slice(0, 7).map(q => [q.id, { type: 'multiple-choice' as const, value: 0 }])
    )

    const result = checkLevelPassThreshold(questions, answers)

    expect(result).toBe(true)
  })

  it('should return false for 60% (6 of 10)', () => {
    const questions = Array(10).fill(null).map((_, i) => ({
      id: `q${i}`,
      difficulty: 1,
      type: 'multiple-choice' as const,
      prompt: 'Test?',
      options: ['A', 'B'],
      correctAnswer: 0
    }))
    const answers = new Map(
      questions.slice(0, 6).map(q => [q.id, { type: 'multiple-choice' as const, value: 0 }])
    )

    const result = checkLevelPassThreshold(questions, answers)

    expect(result).toBe(false)
  })

  it('should handle empty answers', () => {
    const questions = [{ id: 'q1', difficulty: 1, type: 'multiple-choice' as const, prompt: '?', options: ['A'], correctAnswer: 0 }]
    const answers = new Map()

    const result = checkLevelPassThreshold(questions, answers)

    expect(result).toBe(false)
  })
})
