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

/**
 * Get random items from array without duplicates using Fisher-Yates shuffle algorithm
 * @param items - The array to shuffle and sample from
 * @param count - The number of items to return
 * @returns A random subset of items from the input array
 */
export function getRandomQuestions<T>(items: T[], count: number): T[] {
  const shuffled = [...items]
  // Fisher-Yates shuffle algorithm
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

/**
 * Calculate the number of correct answers from questions and user responses
 * @param questions - Array of questions to check
 * @param answers - Map of question IDs to user answers
 * @returns The count of correctly answered questions
 */
function calculateCorrectCount(questions: Question[], answers: Map<string, Answer>): number {
  let correct = 0
  for (const question of questions) {
    let answer = answers.get(question.id)

    // For fill-blank questions, treat missing answer as empty string
    // (user left field blank and pressed Next)
    if (!answer && question.type === 'fill-blank') {
      answer = { type: 'fill-blank', value: '' } as Answer
    }

    // Skip if still no answer or value is null/undefined
    if (!answer || answer.value === null || answer.value === undefined) continue

    if (checkAnswerInternal(question, answer)) correct++
  }
  return correct
}

/**
 * Calculate score with debug output for level completion
 * @param questions - Array of questions in the test
 * @param answers - Map of question IDs to user answers
 * @returns Score result with percentage and pass status
 */
export function calculateLevelTestScore(questions: Question[], answers: Map<string, Answer>): ScoreResult {
  const correct = calculateCorrectCount(questions, answers)
  const total = questions.length
  const score = Math.round((correct / total) * 100)

  // Debug log for final score
  console.log(`[DEBUG] === LEVEL COMPLETE ===`)
  console.log(`[DEBUG] Score: ${correct}/${total} (${score}%)`)
  console.log(`[DEBUG] Threshold: 70%`)
  console.log(`[DEBUG] Result: ${score >= 70 ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`[DEBUG] ======================`)

  return {
    score,
    passed: score >= 70
  }
}

/**
 * Check if an answer is correct for a given question
 * @param question - The question to check against
 * @param answer - The user's answer to validate
 * @returns True if the answer is correct, false otherwise
 */
export function checkAnswer(question: Question, answer: Answer): boolean {
  const correct = checkAnswerInternal(question, answer)

  // Debug log after each answer
  console.log(`[DEBUG] Question: ${question.id} (${question.type})`)
  console.log(`[DEBUG] Your answer: ${formatAnswer(answer)}`)
  console.log(`[DEBUG] Correct answer: ${formatCorrectAnswer(question)}`)
  console.log(`[DEBUG] Result: ${correct ? '✅ CORRECT' : '❌ WRONG'}`)
  console.log('---')

  return correct
}

function checkAnswerInternal(question: Question, answer: Answer): boolean {
  switch (question.type) {
    case 'multiple-choice':
      return answer.type === 'multiple-choice' && answer.value === question.correctAnswer

    case 'fill-blank':
      if (answer.type !== 'fill-blank') return false
      const userAnswer = answer.value.trim().toLowerCase()

      // Handle both string and array correctAnswer
      const correctAnswers = Array.isArray(question.correctAnswer)
        ? question.correctAnswer.map(a => a.toLowerCase())
        : [question.correctAnswer.toLowerCase()]

      return correctAnswers.some(ca => userAnswer === ca)

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

function formatAnswer(answer: Answer): string {
  switch (answer.type) {
    case 'multiple-choice':
      return answer.value === null ? '(not answered)' : `Option ${answer.value}`
    case 'fill-blank':
      return answer.value === null || answer.value === undefined ? '(empty)' : `"${answer.value}"`
    case 'matching':
      return JSON.stringify(answer.value)
    case 'open-ended':
      return answer.value === null || answer.value === undefined ? '(empty)' : answer.value
  }
}

function formatCorrectAnswer(question: Question): string {
  switch (question.type) {
    case 'multiple-choice':
      return `Option ${question.correctAnswer}`
    case 'fill-blank':
      return Array.isArray(question.correctAnswer)
        ? question.correctAnswer.join(' or ')
        : question.correctAnswer
    case 'matching':
      return question.pairs.map(p => `${p.left} → ${p.right}`).join(', ')
    case 'open-ended':
      return question.correctAnswer.join(' or ')
  }
}

/**
 * Check if user passed the level threshold (70%)
 * @param questions - Array of questions in the test
 * @param answers - Map of question IDs to user answers
 * @returns True if the user scored 70% or higher, false otherwise
 */
export function checkLevelPassThreshold(questions: Question[], answers: Map<string, Answer>): boolean {
  if (questions.length === 0) return false

  const correct = calculateCorrectCount(questions, answers)
  const total = questions.length
  const score = correct / total
  const percentage = Math.round(score * 100)

  // Debug log for level completion
  console.log(`[DEBUG] === LEVEL COMPLETE ===`)
  console.log(`[DEBUG] Score: ${correct}/${total} (${percentage}%)`)
  console.log(`[DEBUG] Threshold: 70%`)
  console.log(`[DEBUG] Result: ${score >= 0.7 ? '✅ PASSED' : '❌ FAILED'}`)
  console.log(`[DEBUG] ======================`)

  return score >= 0.7
}

/**
 * Determine CEFR level from placement test results
 * @param results - Array of question results with correctness and difficulty
 * @returns The appropriate CEFR level based on performance
 */
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

  // If no level passed, return the lowest tested level (not A1 default)
  const minDifficulty = Math.min(...Array.from(byDifficulty.keys()))
  return difficultyToLevel(minDifficulty)
}

/**
 * Convert difficulty number to CEFR level
 * @param difficulty - The difficulty rating (1-6)
 * @returns The corresponding CEFR level
 */
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

/**
 * Generate recommendations based on test results
 * @param result - Either a score result from level tests or a CEFR level from placement test
 * @returns Array of recommendation strings based on the result
 */
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
