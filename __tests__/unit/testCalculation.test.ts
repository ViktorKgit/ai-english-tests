import { describe, it, expect } from 'vitest'
import { calculateLevelTestScore, determinePlacementLevel } from '@/lib/utils/testCalculation'
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
