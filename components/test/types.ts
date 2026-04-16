export type CEFRLevel = 'A0' | 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2'

export type QuestionType = 'multiple-choice' | 'fill-blank' | 'matching' | 'open-ended'

export type TestType = 'placement' | 'level'

export interface MultipleChoiceQuestion {
  type: 'multiple-choice'
  prompt: string
  options: string[]
  correctAnswer: number // index of correct option
  explanation?: string
}

export interface FillBlankQuestion {
  type: 'fill-blank'
  prompt: string // with __blank__ placeholder
  correctAnswer: string
  explanation?: string
}

export interface MatchingQuestion {
  type: 'matching'
  pairs: Array<{ left: string; right: string }>
  explanation?: string
}

export interface OpenEndedQuestion {
  type: 'open-ended'
  prompt: string
  correctAnswer: string[] // acceptable answers
  explanation?: string
}

export type Question = {
  id: string
  difficulty: 1 | 2 | 3 | 4 | 5 | 6 // 1=A0, 2=A1, 3=A2, 4=B1, 5=B2, 6=C1/C2
} & (MultipleChoiceQuestion | FillBlankQuestion | MatchingQuestion | OpenEndedQuestion)

export type Answer =
  | { type: 'multiple-choice'; value: number | null }
  | { type: 'fill-blank'; value: string }
  | { type: 'matching'; value: Record<string, string> } // left -> right mapping
  | { type: 'open-ended'; value: string }

export interface TestResult {
  testType: TestType
  level?: CEFRLevel
  score?: number // percentage for level tests
  passed?: boolean
  recommendations: string[]
  completedAt: Date
}

export interface TestState {
  testType: TestType | null
  level?: CEFRLevel
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<string, Answer>
  isComplete: boolean
  result?: TestResult
  currentLevel: CEFRLevel | null  // Currently testing level (for placement test only)
  questionsBank: Map<string, Question[]> | null  // All loaded questions by level
  timeRemaining?: number  // Seconds remaining for current question
}

export interface QuestionSet {
  name: string
  level: CEFRLevel
  questions: Question[]
}
