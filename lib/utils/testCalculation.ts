import type { Question, Answer, CEFRLevel } from '@/components/test/types'

export interface ScoreResult {
  score: number
  passed: boolean
}

export interface QuestionResult {
  questionId: string
  correct: boolean
  difficulty: number
}

// Calculate score for level tests (pass = 70%)
export function calculateLevelTestScore(questions: Question[], answers: Map<string, Answer>): ScoreResult {
  let correct = 0
  const total = questions.length

  for (const question of questions) {
    const answer = answers.get(question.id)
    if (!answer || answer.value === null || answer.value === '') continue

    const isCorrect = checkAnswer(question, answer)
    if (isCorrect) correct++
  }

  const score = Math.round((correct / total) * 100)
  return {
    score,
    passed: score >= 70
  }
}

// Check if answer is correct
function checkAnswer(question: Question, answer: Answer): boolean {
  switch (question.type) {
    case 'multiple-choice':
      return answer.type === 'multiple-choice' && answer.value === question.correctAnswer

    case 'fill-blank':
      return answer.type === 'fill-blank' && answer.value.trim().toLowerCase() === question.correctAnswer.toLowerCase()

    case 'matching':
      if (answer.type !== 'matching') return false
      const allCorrect = question.pairs.every(pair =>
        answer.value[pair.left] === pair.right
      )
      return allCorrect && Object.keys(answer.value).length === question.pairs.length

    case 'open-ended':
      return answer.type === 'open-ended' &&
        question.correctAnswer.some(correct =>
          answer.value.toLowerCase().includes(correct.toLowerCase())
        )
  }
}

// Determine CEFR level from placement test results
export function determinePlacementLevel(results: QuestionResult[]): CEFRLevel {
  // Group by difficulty
  const byDifficulty = new Map<number, { correct: number; total: number }>()

  for (const result of results) {
    const current = byDifficulty.get(result.difficulty) || { correct: 0, total: 0 }
    current.total++
    if (result.correct) current.correct++
    byDifficulty.set(result.difficulty, current)
  }

  // Find highest level with >=70% accuracy
  for (const [difficulty, stats] of Array.from(byDifficulty.entries()).sort((a, b) => b[0] - a[0])) {
    if (stats.total >= 3 && (stats.correct / stats.total) >= 0.7) {
      return difficultyToLevel(difficulty)
    }
  }

  // Default to A1 if nothing passes
  return 'A1'
}

function difficultyToLevel(difficulty: number): CEFRLevel {
  switch (difficulty) {
    case 1: return 'A0'
    case 2: return 'A1'
    case 3: return 'A2'
    case 4: return 'B1'
    case 5: return 'B2'
    case 6: return 'C1'
    default: return 'A1'
  }
}

// Generate recommendations based on results
export function generateRecommendations(result: ScoreResult | CEFRLevel): string[] {
  if (typeof result === 'string') {
    // Placement result
    return [
      `Your level is ${result}.`,
      'Practice daily with exercises appropriate for your level.',
      'Read English books and watch English content.',
      'Consider speaking with native speakers when possible.'
    ]
  }

  // Level test result
  if (result.passed) {
    return [
      'Congratulations! You passed this level.',
      'You can move on to the next level.',
      'Keep practicing to maintain your progress.'
    ]
  } else {
    return [
      'You need more practice at this level.',
      'Review the grammar and vocabulary from this level.',
      'Try again after more study.'
    ]
  }
}
