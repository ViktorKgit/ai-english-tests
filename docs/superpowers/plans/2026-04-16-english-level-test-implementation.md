# English Level Test Platform — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web application for testing English language proficiency with Placement Test (adaptive) and Level-Specific Tests (A0-C2).

**Architecture:** Single-page application in Next.js 15 with React Context for state management, JSON file-based question storage, and localStorage for result persistence.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui, Vitest

---

## File Structure

```
ai-english/
├── app/
│   ├── page.tsx                 # Home page with test selection
│   ├── layout.tsx               # Root layout with providers
│   └── globals.css              # Tailwind + custom styles
├── components/
│   ├── ui/                      # shadcn/ui components (button, card, progress, etc.)
│   ├── test/
│   │   ├── TestProvider.tsx     # React Context for test state
│   │   ├── HomePage.tsx         # Test selection screen
│   │   ├── PlacementTest.tsx    # Adaptive placement test
│   │   ├── LevelTest.tsx        # Fixed level test
│   │   ├── QuestionCard.tsx     # Universal question display
│   │   ├── ProgressBar.tsx      # Progress indicator
│   │   ├── NavigationButtons.tsx # Next/Previous controls
│   │   ├── Results.tsx          # Results screen
│   │   └── types.ts             # Shared TypeScript types
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── questions/               # Question JSON files
│   │   ├── placement-test.json
│   │   ├── a0-a1.json
│   │   ├── a2.json
│   │   ├── b1.json
│   │   ├── b2.json
│   │   ├── c1.json
│   │   └── c2.json
│   └── utils/
│       ├── testCalculation.ts   # Result calculation algorithms
│       └── validation.ts        # Answer validation
└── __tests__/
    ├── unit/
    │   ├── testCalculation.test.ts
    │   └── validation.test.ts
    └── components/
        └── QuestionCard.test.tsx
```

---

## Phase 1: Project Setup

### Task 1: Initialize Next.js project with TypeScript and Tailwind

**Files:**
- Create: Project scaffold via `npx create-next-app@latest`

- [ ] **Step 1: Create Next.js project**

```bash
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --use-npm
```

Expected output: Project created with dependencies installed

- [ ] **Step 2: Install additional dependencies**

```bash
npm install clsx tailwind-merge class-variance-authority
npm install -D vitest @testing-library/react @testing-library/jest-dom @vitejs/plugin-react jsdom
```

- [ ] **Step 3: Create vitest config**

Create: `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./__tests__/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './'),
    },
  },
})
```

- [ ] **Step 4: Create test setup file**

Create: `__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom'
```

- [ ] **Step 5: Update package.json with test script**

Modify: `package.json` - add to scripts section

```json
"scripts": {
  "test": "vitest",
  "test:ui": "vitest --ui"
}
```

- [ ] **Step 6: Initialize git and commit**

```bash
git add .
git commit -m "feat: initialize Next.js project with TypeScript and Tailwind"
```

---

### Task 2: Set up shadcn/ui components

**Files:**
- Create: `components/ui/` directory structure
- Modify: `components.json` (shadcn config)

- [ ] **Step 1: Initialize shadcn/ui**

```bash
npx shadcn@latest init -d
```

Expected output: shadcn initialized with default config

- [ ] **Step 2: Add required shadcn components**

```bash
npx shadcn@latest add button card progress radio select
```

Expected: Button, Card, Progress, Radio, Select components added

- [ ] **Step 3: Verify components are available**

Check that `components/ui/button.tsx` and other components exist

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: add shadcn/ui components"
```

---

### Task 3: Create TypeScript types

**Files:**
- Create: `components/test/types.ts`

- [ ] **Step 1: Write type definitions**

Create: `components/test/types.ts`

```typescript
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
}

export interface QuestionSet {
  name: string
  level: CEFRLevel
  questions: Question[]
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/types.ts
git commit -m "feat: add TypeScript types for test system"
```

---

## Phase 2: Question Data

### Task 4: Create Placement Test questions

**Files:**
- Create: `lib/questions/placement-test.json`

- [ ] **Step 1: Create placement test questions**

Create: `lib/questions/placement-test.json`

```json
{
  "name": "English Placement Test",
  "questions": [
    {
      "id": "placement-1",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I ___ to the store yesterday.",
      "options": ["go", "went", "gone", "going"],
      "correctAnswer": 1,
      "explanation": "Yesterday indicates past tense. 'Went' is the past tense of 'go'."
    },
    {
      "id": "placement-2",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "She has been working here ___ 2020.",
      "options": ["since", "for", "from", "during"],
      "correctAnswer": 0,
      "explanation": "Use 'since' with a specific point in time (2020)."
    },
    {
      "id": "placement-3",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "If I ___ rich, I would travel the world.",
      "correctAnswer": "were",
      "explanation": "Second conditional uses 'were' for all subjects in the if-clause."
    },
    {
      "id": "placement-4",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "There ___ many students in the classroom.",
      "options": ["is", "are", "was", "be"],
      "correctAnswer": 1,
      "explanation": "'Many' requires plural verb 'are'."
    },
    {
      "id": "placement-5",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Despite the bad weather, they decided to ___ with the picnic.",
      "options": ["go on", "go ahead", "carry out", "carry on"],
      "correctAnswer": 1,
      "explanation": "'Go ahead' means to proceed with something. 'Carry on' means continue doing something."
    },
    {
      "id": "placement-6",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "My sister ___ like coffee.",
      "correctAnswer": "doesn't",
      "explanation": "Present simple negative uses 'doesn't' for third person singular."
    },
    {
      "id": "placement-7",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "By the time you arrive, I ___ my homework.",
      "options": ["will finish", "will have finished", "finish", "have finished"],
      "correctAnswer": 1,
      "explanation": "Future perfect tense for action completed before a future time."
    },
    {
      "id": "placement-8",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "What is your name?",
      "options": ["My name is John.", "I name am John.", "Me name is John.", "I is John."],
      "correctAnswer": 0,
      "explanation": "Basic introduction structure."
    },
    {
      "id": "placement-9",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "The new policy, ___ was implemented last month, has caused controversy.",
      "correctAnswer": "which",
      "explanation": "Non-defining relative clause uses 'which'."
    },
    {
      "id": "placement-10",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I look forward to ___ from you.",
      "options": ["hear", "hearing", "heard", "hears"],
      "correctAnswer": 1,
      "explanation": "'Look forward to' is followed by a gerund (-ing form)."
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/questions/placement-test.json
git commit -m "feat: add placement test questions"
```

---

### Task 5: Create A0-A1 Level test questions

**Files:**
- Create: `lib/questions/a0-a1.json`

- [ ] **Step 1: Create A0-A1 test questions**

Create: `lib/questions/a0-a1.json`

```json
{
  "name": "A0-A1 English Test",
  "level": "A1",
  "questions": [
    {
      "id": "a1-1",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "___ you like pizza?",
      "options": ["Does", "Do", "Are", "Is"],
      "correctAnswer": 1,
      "explanation": "Use 'Do' for questions with 'you'."
    },
    {
      "id": "a1-2",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "She ___ a teacher.",
      "correctAnswer": "is",
      "explanation": "Use 'is' with 'she'."
    },
    {
      "id": "a1-3",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "I have ___ apple.",
      "options": ["a", "an", "the", "two"],
      "correctAnswer": 1,
      "explanation": "Use 'an' before words starting with a vowel sound."
    },
    {
      "id": "a1-4",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "Where ___ yesterday?",
      "options": ["you went", "did you go", "did you went", "you go"],
      "correctAnswer": 1,
      "explanation": "Past simple question uses auxiliary 'did'."
    },
    {
      "id": "a1-5",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "They ___ football every Sunday.",
      "correctAnswer": "play",
      "explanation": "Present simple uses base form for 'they'."
    }
  ]
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/questions/a0-a1.json
git commit -m "feat: add A0-A1 test questions"
```

---

### Task 6: Create remaining level test questions (A2-C2)

**Files:**
- Create: `lib/questions/a2.json`, `lib/questions/b1.json`, `lib/questions/b2.json`, `lib/questions/c1.json`, `lib/questions/c2.json`

- [ ] **Step 1: Create A2 level test**

Create: `lib/questions/a2.json`

```json
{
  "name": "A2 English Test",
  "level": "A2",
  "questions": [
    {
      "id": "a2-1",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I used to ___ tennis every weekend.",
      "options": ["play", "playing", "played", "plays"],
      "correctAnswer": 0,
      "explanation": "'Used to' is followed by the infinitive without 'to'."
    },
    {
      "id": "a2-2",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "If it rains, we ___ stay at home.",
      "correctAnswer": "will",
      "explanation": "First conditional: if + present, will + infinitive."
    },
    {
      "id": "a2-3",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "You ___ wear a uniform at work.",
      "options": ["must", "should", "can", "may"],
      "correctAnswer": 0,
      "explanation": "'Must' expresses obligation."
    }
  ]
}
```

- [ ] **Step 2: Create B1 level test**

Create: `lib/questions/b1.json`

```json
{
  "name": "B1 English Test",
  "level": "B1",
  "questions": [
    {
      "id": "b1-1",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "I wish I ___ speak Spanish.",
      "options": ["can", "could", "will", "would"],
      "correctAnswer": 1,
      "explanation": "'Wish' + past tense expresses regret about a present ability."
    },
    {
      "id": "b1-2",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "The film ___ by Spielberg.",
      "correctAnswer": "was directed",
      "explanation": "Passive voice in past tense: was/were + past participle."
    },
    {
      "id": "b1-3",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "She denied ___ the money.",
      "options": ["take", "to take", "taking", "taken"],
      "correctAnswer": 2,
      "explanation": "'Deny' is followed by a gerund (-ing)."
    }
  ]
}
```

- [ ] **Step 3: Create B2 level test**

Create: `lib/questions/b2.json`

```json
{
  "name": "B2 English Test",
  "level": "B2",
  "questions": [
    {
      "id": "b2-1",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Had I known, I ___ have come earlier.",
      "options": ["would", "will", "should", "could"],
      "correctAnswer": 0,
      "explanation": "Third conditional: Had + subject + past participle, would have + past participle."
    },
    {
      "id": "b2-2",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "The report, ___ contains vital information, is missing.",
      "correctAnswer": "which",
      "explanation": "Non-defining relative clause with 'which'."
    },
    {
      "id": "b2-3",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "She suggested that we ___ a meeting.",
      "options": ["had", "have", "would have", "having"],
      "correctAnswer": 1,
      "explanation": "Subjunctive after 'suggest' uses base form."
    }
  ]
}
```

- [ ] **Step 4: Create C1 level test**

Create: `lib/questions/c1.json`

```json
{
  "name": "C1 English Test",
  "level": "C1",
  "questions": [
    {
      "id": "c1-1",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "But for your help, I ___ the project.",
      "options": ["wouldn't complete", "wouldn't have completed", "didn't complete", "hadn't completed"],
      "correctAnswer": 1,
      "explanation": "'But for' acts like 'Without', triggering third conditional."
    },
    {
      "id": "c1-2",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The proposal was met with ___ criticism.",
      "correctAnswer": "widespread",
      "explanation": "'Widespread' is the appropriate collocation for criticism."
    },
    {
      "id": "c1-3",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "Rarely ___ such a brilliant performance.",
      "options": ["we have seen", "have we seen", "we saw", "did we see"],
      "correctAnswer": 1,
      "explanation": "Negative inversion: Rarely + auxiliary + subject + main verb."
    }
  ]
}
```

- [ ] **Step 5: Create C2 level test**

Create: `lib/questions/c2.json`

```json
{
  "name": "C2 English Test",
  "level": "C2",
  "questions": [
    {
      "id": "c2-1",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "The distinction between the two concepts is rather ___.",
      "options": ["subtle", "subtlely", "subtlety", "subtly"],
      "correctAnswer": 0,
      "explanation": "'Subtle' is the adjective modifying 'distinction'."
    },
    {
      "id": "c2-2",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "His argument was ___ flawed.",
      "correctAnswer": "inherently",
      "explanation": "'Inherently' means fundamentally or intrinsically."
    },
    {
      "id": "c2-3",
      "difficulty": 6,
      "type": "open-ended",
      "prompt": "Explain the difference between 'affect' and 'effect' with examples.",
      "correctAnswer": ["affect is a verb", "effect is a noun", "influence", "result"],
      "explanation": "Affect (verb) means to influence. Effect (noun) means result."
    }
  ]
}
```

- [ ] **Step 6: Commit all remaining level tests**

```bash
git add lib/questions/a2.json lib/questions/b1.json lib/questions/b2.json lib/questions/c1.json lib/questions/c2.json
git commit -m "feat: add A2-C2 level test questions"
```

---

## Phase 3: Core Utilities

### Task 7: Implement test calculation utilities

**Files:**
- Create: `lib/utils/testCalculation.ts`
- Test: `__tests__/unit/testCalculation.test.ts`

- [ ] **Step 1: Write failing test for score calculation**

Create: `__tests__/unit/testCalculation.test.ts`

```typescript
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
      { questionId: '3', correct: false, difficulty: 4 },
    ])

    expect(result).toBe('B1')
  })
})
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npm run test
```

Expected: FAIL - functions not defined

- [ ] **Step 3: Implement test calculation functions**

Create: `lib/utils/testCalculation.ts`

```typescript
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
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npm run test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/testCalculation.ts __tests__/unit/testCalculation.test.ts
git commit -m "feat: implement test calculation utilities with tests"
```

---

### Task 8: Implement answer validation utilities

**Files:**
- Create: `lib/utils/validation.ts`
- Test: `__tests__/unit/validation.test.ts`

- [ ] **Step 1: Write failing tests for validation**

Create: `__tests__/unit/validation.test.ts`

```typescript
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
```

- [ ] **Step 2: Run tests to verify failure**

```bash
npm run test
```

Expected: FAIL - functions not defined

- [ ] **Step 3: Implement validation functions**

Create: `lib/utils/validation.ts`

```typescript
import type { Question, Answer } from '@/components/test/types'

export interface ValidationResult {
  valid: boolean
  error?: string
}

export function validateAnswer(question: Question, answer: Answer): ValidationResult {
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
      if (!answer.value || answer.value.trim(). === '') {
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
```

- [ ] **Step 4: Run tests to verify pass**

```bash
npm run test
```

Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/validation.ts __tests__/unit/validation.test.ts
git commit -m "feat: implement answer validation utilities with tests"
```

---

## Phase 4: Components

### Task 9: Create TestContext Provider

**Files:**
- Create: `components/test/TestProvider.tsx`

- [ ] **Step 1: Create TestContext**

Create: `components/test/TestProvider.tsx`

```typescript
'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { TestState, TestType, CEFRLevel, Question, Answer, TestResult } from './types'
import { calculateLevelTestScore, determinePlacementLevel, generateRecommendations } from '@/lib/utils/testCalculation'

interface TestContextType extends TestState {
  startTest: (testType: TestType, level?: CEFRLevel) => Promise<void>
  answerQuestion: (questionId: string, answer: Answer) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeTest: () => void
  restart: () => void
}

const TestContext = createContext<TestContextType | null>(null)

export function useTest() {
  const context = useContext(TestContext)
  if (!context) throw new Error('useTest must be used within TestProvider')
  return context
}

interface TestProviderProps {
  children: React.ReactNode
}

export function TestProvider({ children }: TestProviderProps) {
  const [state, setState] = useState<TestState>({
    testType: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: new Map(),
    isComplete: false,
  })

  const startTest = useCallback(async (testType: TestType, level?: CEFRLevel) => {
    let questions: Question[] = []

    if (testType === 'placement') {
      const response = await fetch('/lib/questions/placement-test.json')
      const data = await response.json()
      questions = data.questions
    } else if (level) {
      const levelMap: Record<CEFRLevel, string> = {
        'A0': 'a0-a1',
        'A1': 'a0-a1',
        'A2': 'a2',
        'B1': 'b1',
        'B2': 'b2',
        'C1': 'c1',
        'C2': 'c2',
      }
      const response = await fetch(`/lib/questions/${levelMap[level]}.json`)
      const data = await response.json()
      questions = data.questions
    }

    setState({
      testType,
      level,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
    })
  }, [])

  const answerQuestion = useCallback((questionId: string, answer: Answer) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      newAnswers.set(questionId, answer)
      return { ...prev, answers: newAnswers }
    })
  }, [])

  const goToQuestion = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }))
  }, [])

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }))
  }, [])

  const completeTest = useCallback(() => {
    setState(prev => {
      let result: TestResult

      if (prev.testType === 'placement') {
        // Calculate placement result
        const results = prev.questions.map((q, i) => ({
          questionId: q.id,
          correct: isAnswerCorrect(q, prev.answers.get(q.id)),
          difficulty: q.difficulty,
        }))
        const level = determinePlacementLevel(results)
        result = {
          testType: 'placement',
          level,
          recommendations: generateRecommendations(level),
          completedAt: new Date(),
        }
      } else {
        // Calculate level test result
        const scoreResult = calculateLevelTestScore(prev.questions, prev.answers)
        result = {
          testType: 'level',
          level: prev.level,
          score: scoreResult.score,
          passed: scoreResult.passed,
          recommendations: generateRecommendations(scoreResult),
          completedAt: new Date(),
        }
      }

      // Save to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]')
        history.push(result)
        localStorage.setItem('testHistory', JSON.stringify(history))
      } catch (e) {
        console.error('Failed to save to localStorage', e)
      }

      return { ...prev, isComplete: true, result }
    })
  }, [])

  const restart = useCallback(() => {
    setState({
      testType: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
      result: undefined,
    })
  }, [])

  return (
    <TestContext.Provider
      value={{
        ...state,
        startTest,
        answerQuestion,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        completeTest,
        restart,
      }}
    >
      {children}
    </TestContext.Provider>
  )
}

function isAnswerCorrect(question: Question, answer?: Answer): boolean {
  if (!answer) return false

  switch (question.type) {
    case 'multiple-choice':
      return answer.type === 'multiple-choice' && answer.value === question.correctAnswer
    case 'fill-blank':
      return answer.type === 'fill-blank' && answer.value.toLowerCase() === question.correctAnswer.toLowerCase()
    case 'matching':
      return answer.type === 'matching' &&
        question.pairs.every(p => answer.value[p.left] === p.right)
    case 'open-ended':
      return answer.type === 'open-ended' &&
        question.correctAnswer.some(a => answer.value.toLowerCase().includes(a.toLowerCase()))
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/TestProvider.tsx
git commit -m "feat: create TestContext provider"
```

---

### Task 10: Create HomePage component

**Files:**
- Create: `components/test/HomePage.tsx`

- [ ] **Step 1: Create HomePage component**

Create: `components/test/HomePage.tsx`

```typescript
'use client'

import { useTest } from './TestProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CEFRLevel } from './types'

const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const levelDescriptions: Record<CEFRLevel, string> = {
  'A0': 'Beginner - No prior knowledge',
  'A1': 'Elementary - Basic phrases',
  'A2': 'Pre-Intermediate - Simple communication',
  'B1': 'Intermediate - Daily situations',
  'B2': 'Upper-Intermediate - Complex topics',
  'C1': 'Advanced - Academic/professional',
  'C2': 'Proficiency - Near-native fluency',
}

export function HomePage() {
  const { startTest } = useTest()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            English Level Test
          </h1>
          <p className="text-lg text-slate-600">
            Determine your English proficiency level according to the CEFR scale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Placement Test</CardTitle>
              <CardDescription>
                Not sure of your level? Let us determine it for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => startTest('placement')}
                className="w-full"
                size="lg"
              >
                Start Placement Test
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                ~20-30 questions • Adaptive difficulty
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Level Test</CardTitle>
              <CardDescription>
                Test a specific CEFR level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {levels.map(level => (
                <Button
                  key={level}
                  onClick={() => startTest('level', level)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>Level {level}</span>
                  <span className="text-sm text-slate-500">{levelDescriptions[level]}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/HomePage.tsx
git commit -m "feat: create HomePage component"
```

---

### Task 11: Create QuestionCard component

**Files:**
- Create: `components/test/QuestionCard.tsx`

- [ ] **Step 1: Create QuestionCard component**

Create: `components/test/QuestionCard.tsx`

```typescript
'use client'

import { useState } from 'react'
import type { Question, Answer } from './types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuestionCardProps {
  question: Question
  answer?: Answer
  onAnswerChange: (answer: Answer) => void
  showFeedback?: boolean
}

export function QuestionCard({ question, answer, onAnswerChange, showFeedback }: QuestionCardProps) {
  const [localValue, setLocalValue] = useState<Answer['value']>(answer?.value ?? null)

  const handleChange = (newValue: Answer['value']) => {
    setLocalValue(newValue)
    onAnswerChange({ type: question.type, value: newValue } as Answer)
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleChange(index)}
                variant={localValue === index ? 'default' : 'outline'}
                className="w-full justify-start text-left h-auto py-4 px-6"
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        )

      case 'fill-blank':
        const parts = question.prompt.split('__blank__')
        return (
          <div className="space-y-4">
            <p className="text-lg">
              {parts[0]}
              <input
                type="text"
                value={localValue as string || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="mx-2 px-3 py-1 border-b-2 border-slate-300 focus:border-slate-600 outline-none bg-transparent w-32"
                placeholder="..."
                autoFocus
              />
              {parts[1]}
            </p>
          </div>
        )

      case 'matching':
        const currentMatches = localValue as Record<string, string> || {}
        return (
          <div className="space-y-4">
            {question.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="font-medium min-w-[120px]">{pair.left}</span>
                <span>→</span>
                <select
                  value={currentMatches[pair.left] || ''}
                  onChange={(e) => {
                    const newMatches = { ...currentMatches, [pair.left]: e.target.value }
                    handleChange(newMatches)
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select match...</option>
                  {question.pairs.map((p, i) => (
                    <option key={i} value={p.right}>{p.right}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )

      case 'open-ended':
        return (
          <div className="space-y-4">
            <textarea
              value={localValue as string || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full min-h-[120px] px-4 py-3 border border-slate-300 rounded-md resize-y"
            />
            <p className="text-sm text-slate-500">
              Provide a detailed answer (at least 3 words)
            </p>
          </div>
        )
    }
  }

  return (
    <Card className="border-2 border-slate-200">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Question</span>
          <span className="text-sm font-normal text-slate-500">
            {question.type === 'multiple-choice' && 'Select one answer'}
            {question.type === 'fill-blank' && 'Fill in the blank'}
            {question.type === 'matching' && 'Match the pairs'}
            {question.type === 'open-ended' && 'Open-ended response'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-lg font-medium text-slate-800">
            {question.type !== 'fill-blank' && question.prompt}
          </p>
        </div>
        {renderQuestion()}
      </CardContent>
    </Card>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/QuestionCard.tsx
git commit -m "feat: create QuestionCard component"
```

---

### Task 12: Create ProgressBar component

**Files:**
- Create: `components/test/ProgressBar.tsx`

- [ ] **Step 1: Create ProgressBar component**

Create: `components/test/ProgressBar.tsx`

```typescript
'use client'

import { Progress } from '@/components/ui/progress'
import type { Question } from './types'

interface ProgressBarProps {
  questions: Question[]
  currentIndex: number
}

export function ProgressBar({ questions, currentIndex }: ProgressBarProps) {
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-600">
          Progress
        </span>
        <span className="text-sm text-slate-600">
          {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/ProgressBar.tsx
git commit -m "feat: create ProgressBar component"
```

---

### Task 13: Create NavigationButtons component

**Files:**
- Create: `components/test/NavigationButtons.tsx`

- [ ] **Step 1: Create NavigationButtons component**

Create: `components/test/NavigationButtons.tsx`

```typescript
'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { validateAnswer } from '@/lib/utils/validation'
import type { Question, Answer } from './types'

interface NavigationButtonsProps {
  questions: Question[]
  currentIndex: number
  answers: Map<string, Answer>
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}

export function NavigationButtons({
  questions,
  currentIndex,
  answers,
  onPrevious,
  onNext,
  onComplete,
}: NavigationButtonsProps) {
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion.id)

  const validation = validateAnswer(currentQuestion, currentAnswer || { type: currentQuestion.type, value: null })
  const canProceed = validation.valid

  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="flex justify-between items-center">
      <Button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        variant="outline"
        size="lg"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {!validation.valid && currentAnswer && (
        <span className="text-sm text-red-500">{validation.error}</span>
      )}

      {isLastQuestion ? (
        <Button
          onClick={onComplete}
          disabled={!canProceed}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Test
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/NavigationButtons.tsx
git commit -m "feat: create NavigationButtons component"
```

---

### Task 14: Create Results component

**Files:**
- Create: `components/test/Results.tsx`

- [ ] **Step 1: Create Results component**

Create: `components/test/Results.tsx`

```typescript
'use client'

import { useTest } from './TestProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Award } from 'lucide-react'

export function Results() {
  const { result, restart, questions, answers } = useTest()

  if (!result) return null

  const isPlacement = result.testType === 'placement'
  const passed = result.passed ?? false

  // Calculate score details
  let correct = 0
  const total = questions.length

  for (const question of questions) {
    const answer = answers.get(question.id)
    if (!answer) continue

    const isCorrect = checkIsCorrect(question, answer)
    if (isCorrect) correct++
  }

  function checkIsCorrect(question: any, answer: any): boolean {
    switch (question.type) {
      case 'multiple-choice':
        return answer.value === question.correctAnswer
      case 'fill-blank':
        return answer.value.toLowerCase() === question.correctAnswer.toLowerCase()
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed || isPlacement ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {isPlacement ? 'Your Level' : passed ? 'Passed!' : 'Not Passed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPlacement ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 mb-2">
                  {result.level}
                </div>
                <p className="text-slate-600">
                  Based on your performance, your English level is {result.level}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 mb-2">
                  {result.score}%
                </div>
                <p className="text-slate-600">
                  {correct} out of {total} correct answers
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span className="text-slate-600">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={restart} variant="outline" className="flex-1">
                Take Another Test
              </Button>
              <Button onClick={restart} className="flex-1">
                Retry Same Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add components/test/Results.tsx
git commit -m "feat: create Results component"
```

---

### Task 15: Create LevelTest and PlacementTest wrapper components

**Files:**
- Create: `components/test/PlacementTest.tsx`
- Create: `components/test/LevelTest.tsx`

- [ ] **Step 1: Create PlacementTest wrapper**

Create: `components/test/PlacementTest.tsx`

```typescript
'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'

export function PlacementTest() {
  const { questions, currentQuestionIndex, answers, answerQuestion, previousQuestion, nextQuestion, completeTest } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Placement Test</h1>
          <p className="text-slate-600">Answer each question to help determine your level.</p>
        </div>

        <ProgressBar questions={questions} currentIndex={currentQuestionIndex} />

        <div className="mt-6">
          <QuestionCard
            question={currentQuestion}
            answer={answers.get(currentQuestion.id)}
            onAnswerChange={(answer) => answerQuestion(currentQuestion.id, answer)}
          />
        </div>

        <div className="mt-6">
          <NavigationButtons
            questions={questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onComplete={completeTest}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create LevelTest wrapper**

Create: `components/test/LevelTest.tsx`

```typescript
'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'

export function LevelTest() {
  const { questions, currentQuestionIndex, answers, answerQuestion, previousQuestion, nextQuestion, completeTest, level } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Level {level} Test</h1>
          <p className="text-slate-600">Answer each question. You need 70% to pass.</p>
        </div>

        <ProgressBar questions={questions} currentIndex={currentQuestionIndex} />

        <div className="mt-6">
          <QuestionCard
            question={currentQuestion}
            answer={answers.get(currentQuestion.id)}
            onAnswerChange={(answer) => answerQuestion(currentQuestion.id, answer)}
          />
        </div>

        <div className="mt-6">
          <NavigationButtons
            questions={questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onPrevious={previousQuestion}
            onNext={nextQuestion}
            onComplete={completeTest}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add components/test/PlacementTest.tsx components/test/LevelTest.tsx
git commit -m "feat: create PlacementTest and LevelTest wrapper components"
```

---

## Phase 5: Main App Integration

### Task 16: Create main page and layout

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update globals.css with Tailwind and custom styles**

Modify: `app/globals.css`

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

- [ ] **Step 2: Update layout.tsx with TestProvider**

Modify: `app/layout.tsx`

```typescript
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { TestProvider } from '@/components/test/TestProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'English Level Test - Determine Your CEFR Level',
  description: 'Test your English proficiency level with our adaptive placement test and level-specific tests.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <TestProvider>
          {children}
        </TestProvider>
      </body>
    </html>
  )
}
```

- [ ] **Step 3: Create main page**

Modify: `app/page.tsx`

```typescript
'use client'

import { useTest } from '@/components/test/TestProvider'
import { HomePage } from '@/components/test/HomePage'
import { PlacementTest } from '@/components/test/PlacementTest'
import { LevelTest } from '@/components/test/LevelTest'
import { Results } from '@/components/test/Results'

export default function Home() {
  const { testType, isComplete } = useTest()

  if (isComplete) {
    return <Results />
  }

  if (!testType) {
    return <HomePage />
  }

  if (testType === 'placement') {
    return <PlacementTest />
  }

  return <LevelTest />
}
```

- [ ] **Step 4: Commit**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat: integrate all components into main app"
```

---

### Task 17: Make question files accessible via public directory

**Files:**
- Move question files to public directory

- [ ] **Step 1: Move question files to public directory**

```bash
mkdir -p public/questions
mv lib/questions/*.json public/questions/
```

- [ ] **Step 2: Update fetch paths in TestProvider**

Modify: `components/test/TestProvider.tsx` - update fetch paths

```typescript
// Change from:
const response = await fetch('/lib/questions/placement-test.json')
// To:
const response = await fetch('/questions/placement-test.json')

// And for level tests:
const response = await fetch(`/questions/${levelMap[level]}.json`)
```

- [ ] **Step 3: Commit**

```bash
git add public/questions/ components/test/TestProvider.tsx
git commit -m "feat: move question files to public directory"
```

---

## Phase 6: Final Polish

### Task 18: Add lucide-react icons dependency

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install lucide-react**

```bash
npm install lucide-react
```

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add lucide-react for icons"
```

---

### Task 19: Test the complete application

**Files:**
- None (manual testing)

- [ ] **Step 1: Start development server**

```bash
npm run dev
```

- [ ] **Step 2: Test Placement Test flow**
1. Navigate to http://localhost:3000
2. Click "Start Placement Test"
3. Answer all questions
4. Complete test
5. Verify results display correctly

- [ ] **Step 3: Test Level Test flow**
1. Navigate to homepage
2. Select "Level A1"
3. Answer all questions
4. Complete test
5. Verify results and pass/fail logic

- [ ] **Step 4: Verify all question types work**
- Multiple choice
- Fill blank
- Matching
- Open ended

- [ ] **Step 5: Run unit tests**

```bash
npm run test
```

Expected: All tests pass

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "test: verify complete application functionality"
```

---

### Task 20: Final documentation and cleanup

**Files:**
- Create: `README.md`

- [ ] **Step 1: Create README**

Create: `README.md`

```markdown
# English Level Test Platform

A web application for testing English language proficiency according to the CEFR scale (A0-C2).

## Features

- **Placement Test**: Adaptive test to determine your English level automatically
- **Level-Specific Tests**: Fixed tests for each CEFR level (A0-A1, A2, B1, B2, C1, C2)
- **Multiple Question Types**: Multiple choice, fill in the blank, matching, and open-ended questions
- **Instant Results**: Get your level or score immediately after completing the test

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

### Running Tests

```bash
npm run test
```

## Tech Stack

- Next.js 15
- React 19
- TypeScript
- Tailwind CSS
- shadcn/ui
- Vitest

## Project Structure

```
ai-english/
├── app/                    # Next.js app directory
├── components/
│   ├── test/              # Test-related components
│   └── ui/                # shadcn/ui components
├── lib/
│   ├── questions/         # Question data (in public/)
│   └── utils/             # Utility functions
└── __tests__/             # Test files
```

## CEFR Levels

- **A0-A1**: Beginner/Elementary
- **A2**: Pre-Intermediate
- **B1**: Intermediate
- **B2**: Upper-Intermediate
- **C1**: Advanced
- **C2**: Proficiency
```

- [ ] **Step 2: Final commit**

```bash
git add README.md
git commit -m "docs: add comprehensive README"
```

---

## Summary

This implementation plan creates a complete English level testing platform with:

1. **Project Setup**: Next.js 15 with TypeScript and Tailwind CSS
2. **Question Data**: JSON files for placement test and all CEFR levels
3. **Core Utilities**: Test calculation and validation functions with unit tests
4. **Components**: Complete UI with context state management
5. **Integration**: Full app integration with routing and state flow
6. **Testing**: Unit tests for utilities, manual E2E testing

**Total estimated tasks**: 20
**Total estimated commits**: ~25 commits

Each task is designed to be completed in 5-15 minutes with clear verification steps.
