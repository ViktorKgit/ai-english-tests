# Adaptive Placement Test Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign placement test to be a sequential adaptive assessment that evaluates students level by level (A0 → A1 → ... → C2), stopping when they fail or complete C2, with randomized questions from a larger bank.

**Architecture:** Client-side only approach where all question files are loaded at startup (~50-100KB), questions are randomly selected per level, and progression is managed through React state. Each level is tested independently with 70% threshold for advancement.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS, Vitest

---

## File Structure

**New files to create:**
- `public/questions/a0.json` — 20+ A0 level questions
- `public/questions/a1.json` — 20+ A1 level questions
- `public/questions/a2.json` — 20+ A2 level questions
- `public/questions/b1.json` — 20+ B1 level questions
- `public/questions/b2.json` — 20+ B2 level questions
- `public/questions/c1.json` — 20+ C1 level questions
- `public/questions/c2.json` — 20+ C2 level questions
- `components/test/AdaptivePlacementTest.tsx` — Main adaptive test component
- `__tests__/integration/adaptive-placement.test.tsx` — Integration tests

**Files to modify:**
- `components/test/TestProvider.tsx` — Add adaptive test state and methods
- `lib/utils/testCalculation.ts` — Add randomization and level-check utilities
- `components/test/page.tsx` — Route to AdaptivePlacementTest for placement

**Files to archive:**
- `public/questions/placement-test.json` → Archive or delete
- `public/questions/a0-a1.json` → Archive or delete
- `components/test/PlacementTest.tsx` → Replace with AdaptivePlacementTest

---

## Task 1: Add Utility Functions for Randomization and Level Checking

**Files:**
- Modify: `lib/utils/testCalculation.ts`
- Test: `__tests__/unit/testCalculation.test.ts`

- [ ] **Step 1: Write failing test for getRandomQuestions**

```typescript
// In __tests__/unit/testCalculation.test.ts
import { getRandomQuestions } from '@/lib/utils/testCalculation'

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
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- testCalculation`
Expected: FAIL with "getRandomQuestions is not defined"

- [ ] **Step 3: Implement getRandomQuestions**

```typescript
// In lib/utils/testCalculation.ts

export function getRandomQuestions<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}

// Type guard for question arrays
export function isQuestionArray(value: unknown[]): value is Question[] {
  return value.length > 0 && 'id' in value[0] && 'type' in value[0]
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- testCalculation`
Expected: PASS for getRandomQuestions tests

- [ ] **Step 5: Write failing test for checkLevelPassThreshold**

```typescript
// In __tests__/unit/testCalculation.test.ts
import { checkLevelPassThreshold } from '@/lib/utils/testCalculation'

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
```

- [ ] **Step 6: Run test to verify it fails**

Run: `npm test -- testCalculation`
Expected: FAIL with "checkLevelPassThreshold is not defined"

- [ ] **Step 7: Implement checkLevelPassThreshold**

```typescript
// In lib/utils/testCalculation.ts

export function checkLevelPassThreshold(questions: Question[], answers: Map<string, Answer>): boolean {
  if (questions.length === 0) return false

  let correct = 0
  for (const question of questions) {
    const answer = answers.get(question.id)
    if (!answer || answer.value === null || answer.value === '') continue

    const isCorrect = checkAnswer(question, answer)
    if (isCorrect) correct++
  }

  const score = correct / questions.length
  return score >= 0.7
}
```

- [ ] **Step 8: Run test to verify it passes**

Run: `npm test -- testCalculation`
Expected: PASS for all checkLevelPassThreshold tests

- [ ] **Step 9: Commit**

```bash
git add lib/utils/testCalculation.ts __tests__/unit/testCalculation.test.ts
git commit -m "feat: add randomization and level-check utilities"
```

---

## Task 2: Create A0 Questions File (20+ questions)

**Files:**
- Create: `public/questions/a0.json`

- [ ] **Step 1: Create a0.json with 20 A0 level questions**

```json
{
  "name": "A0 English Test",
  "level": "A0",
  "questions": [
    {
      "id": "a0-1",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "What is your name?",
      "options": ["My name is John.", "I name am John.", "Me name is John.", "I is John."],
      "correctAnswer": 0,
      "explanation": "Basic introduction uses 'My name is...'"
    },
    {
      "id": "a0-2",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "___ you like pizza?",
      "options": ["Does", "Do", "Are", "Is"],
      "correctAnswer": 1,
      "explanation": "Use 'Do' for questions with 'you'."
    },
    {
      "id": "a0-3",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "She ___ a teacher.",
      "correctAnswer": "is",
      "explanation": "Use 'is' with 'she'."
    },
    {
      "id": "a0-4",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "I have ___ apple.",
      "options": ["a", "an", "the", "two"],
      "correctAnswer": 1,
      "explanation": "Use 'an' before words starting with a vowel sound."
    },
    {
      "id": "a0-5",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "They ___ football every Sunday.",
      "correctAnswer": "play",
      "explanation": "Present simple uses base form for 'they'."
    },
    {
      "id": "a0-6",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "The cat ___ on the table.",
      "options": ["is", "are", "am", "be"],
      "correctAnswer": 0,
      "explanation": "Use 'is' with singular animals/things."
    },
    {
      "id": "a0-7",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "I ___ happy today.",
      "correctAnswer": "am",
      "explanation": "Use 'am' with 'I'."
    },
    {
      "id": "a0-8",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "We ___ students.",
      "options": ["is", "am", "are", "be"],
      "correctAnswer": 2,
      "explanation": "Use 'are' with 'we'."
    },
    {
      "id": "a0-9",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "He ___ not like coffee.",
      "correctAnswer": "does",
      "explanation": "Present simple negative uses 'doesn't' (does not) for he."
    },
    {
      "id": "a0-10",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "___ is your friend?",
      "options": ["What", "Who", "Where", "When"],
      "correctAnswer": 1,
      "explanation": "Use 'Who' for asking about people."
    },
    {
      "id": "a0-11",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "My sister ___ in London.",
      "correctAnswer": "lives",
      "explanation": "Third person singular adds 's' in present simple."
    },
    {
      "id": "a0-12",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "I don't have ___ money.",
      "options": ["some", "any", "a", "an"],
      "correctAnswer": 1,
      "explanation": "Use 'any' in negative sentences."
    },
    {
      "id": "a0-13",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "___ you speak English?",
      "correctAnswer": "Do",
      "explanation": "Yes/No questions start with 'Do' for 'you'."
    },
    {
      "id": "a0-14",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "There ___ a book on the table.",
      "options": ["is", "are", "be", "am"],
      "correctAnswer": 0,
      "explanation": "Use 'is' with singular subjects."
    },
    {
      "id": "a0-15",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "She ___ like tea.",
      "correctAnswer": "doesn't",
      "explanation": "Third person singular negative uses 'doesn't'."
    },
    {
      "id": "a0-16",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "What is this? It ___ a pen.",
      "options": ["is", "are", "am", "be"],
      "correctAnswer": 0,
      "explanation": "Use 'is' for singular objects."
    },
    {
      "id": "a0-17",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "They ___ from Spain.",
      "correctAnswer": "are",
      "explanation": "Use 'are' with 'they'."
    },
    {
      "id": "a0-18",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "I ___ a student.",
      "options": ["is", "am", "are", "be"],
      "correctAnswer": 1,
      "explanation": "Use 'am' with 'I'."
    },
    {
      "id": "a0-19",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "We don't have ___ time.",
      "correctAnswer": "much",
      "explanation": "Use 'much' with uncountable nouns like time."
    },
    {
      "id": "a0-20",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "___ are you from?",
      "options": ["What", "Who", "Where", "When"],
      "correctAnswer": 2,
      "explanation": "Use 'Where' for asking about origin/place."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/a0.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/a0.json
git commit -m "feat: add A0 level questions (20 questions)"
```

---

## Task 3: Create A1 Questions File (20+ questions)

**Files:**
- Create: `public/questions/a1.json`

- [ ] **Step 1: Create a1.json with 20 A1 level questions**

```json
{
  "name": "A1 English Test",
  "level": "A1",
  "questions": [
    {
      "id": "a1-1",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "Where ___ yesterday?",
      "options": ["you went", "did you go", "did you went", "you go"],
      "correctAnswer": 1,
      "explanation": "Past simple questions use auxiliary 'did' + base verb."
    },
    {
      "id": "a1-2",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "I ___ to the store yesterday.",
      "correctAnswer": "went",
      "explanation": "Irregular past tense of 'go' is 'went'."
    },
    {
      "id": "a1-3",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "She ___ to London last week.",
      "options": ["go", "goes", "went", "going"],
      "correctAnswer": 2,
      "explanation": "Past tense of 'go' is 'went'."
    },
    {
      "id": "a1-4",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "They ___ TV every evening.",
      "correctAnswer": "watch",
      "explanation": "Present simple uses base form for 'they'."
    },
    {
      "id": "a1-5",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "I ___ my homework tomorrow.",
      "options": ["do", "will do", "did", "doing"],
      "correctAnswer": 1,
      "explanation": "Future with 'will' + base verb."
    },
    {
      "id": "a1-6",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "She ___ her keys yesterday.",
      "correctAnswer": "lost",
      "explanation": "Past tense of 'lose' is 'lost'."
    },
    {
      "id": "a1-7",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "We ___ breakfast at 7 AM.",
      "options": ["eat", "eats", "eating", "ate"],
      "correctAnswer": 3,
      "explanation": "Past tense of 'eat' is 'ate'."
    },
    {
      "id": "a1-8",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "He ___ like coffee.",
      "correctAnswer": "doesn't",
      "explanation": "Third person negative uses 'doesn't'."
    },
    {
      "id": "a1-9",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "What ___ doing?",
      "options": ["are you", "you are", "do you", "you do"],
      "correctAnswer": 0,
      "explanation": "Present continuous question: 'are' + subject + '-ing'."
    },
    {
      "id": "a1-10",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "I am ___ a book now.",
      "correctAnswer": "reading",
      "explanation": "Present continuous uses 'am + verb-ing'."
    },
    {
      "id": "a1-11",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "There ___ many people at the party.",
      "options": ["was", "is", "were", "are"],
      "correctAnswer": 2,
      "explanation": "Past tense of 'there are' is 'there were'."
    },
    {
      "id": "a1-12",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "She ___ happy yesterday.",
      "correctAnswer": "was",
      "explanation": "Past tense of 'is' is 'was'."
    },
    {
      "id": "a1-13",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "I ___ football when I was young.",
      "options": ["play", "played", "playing", "plays"],
      "correctAnswer": 1,
      "explanation": "Past simple for completed action in the past."
    },
    {
      "id": "a1-14",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "We ___ tired now.",
      "correctAnswer": "are",
      "explanation": "Present tense of 'to be' with 'we' is 'are'."
    },
    {
      "id": "a1-15",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "___ you like chocolate?",
      "options": ["Are", "Do", "Does", "Is"],
      "correctAnswer": 1,
      "explanation": "Yes/No questions with 'like' use 'Do'."
    },
    {
      "id": "a1-16",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "He ___ to school every day.",
      "correctAnswer": "goes",
      "explanation": "Third person singular adds 'es'."
    },
    {
      "id": "a1-17",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "I ___ my keys. Can you help me find them?",
      "options": ["lost", "lose", "have lost", "losing"],
      "correctAnswer": 0,
      "explanation": "Past simple for completed action."
    },
    {
      "id": "a1-18",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "They ___ dinner right now.",
      "correctAnswer": "are having",
      "explanation": "Present continuous: 'are' + verb-ing."
    },
    {
      "id": "a1-19",
      "difficulty": 2,
      "type": "multiple-choice",
      "prompt": "She ___ English very well.",
      "options": ["speak", "speaks", "speaking", "spoke"],
      "correctAnswer": 1,
      "explanation": "Present simple third person adds 's'."
    },
    {
      "id": "a1-20",
      "difficulty": 2,
      "type": "fill-blank",
      "prompt": "What did you ___ yesterday?",
      "correctAnswer": "do",
      "explanation": "Past simple questions use 'did' + base verb."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/a1.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/a1.json
git commit -m "feat: add A1 level questions (20 questions)"
```

---

## Task 4: Create A2 Questions File (20+ questions)

**Files:**
- Create: `public/questions/a2.json`

- [ ] **Step 1: Create a2.json with 20 A2 level questions**

```json
{
  "name": "A2 English Test",
  "level": "A2",
  "questions": [
    {
      "id": "a2-1",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I ___ to the store yesterday.",
      "options": ["go", "went", "gone", "going"],
      "correctAnswer": 1,
      "explanation": "Past tense of 'go' is 'went'."
    },
    {
      "id": "a2-2",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "She has been working here ___ 2020.",
      "correctAnswer": "since",
      "explanation": "Use 'since' with a specific point in time."
    },
    {
      "id": "a2-3",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I look forward to ___ from you.",
      "options": ["hear", "hearing", "heard", "hears"],
      "correctAnswer": 1,
      "explanation": "'Look forward to' is followed by a gerund (-ing)."
    },
    {
      "id": "a2-4",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "If I ___ rich, I would travel the world.",
      "correctAnswer": "were",
      "explanation": "Second conditional uses 'were' for all subjects."
    },
    {
      "id": "a2-5",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "By next year, I ___ my degree.",
      "options": ["will finish", "will have finished", "finish", "have finished"],
      "correctAnswer": 1,
      "explanation": "Future perfect for action completed before a future time."
    },
    {
      "id": "a2-6",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "I wish I ___ speak French.",
      "correctAnswer": "could",
      "explanation": "'Wish + could' for imaginary ability."
    },
    {
      "id": "a2-7",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "The movie was ___ than I expected.",
      "options": ["more interesting", "interesting", "most interesting", "interestinger"],
      "correctAnswer": 0,
      "explanation": "Comparative: 'more + adjective' for longer words."
    },
    {
      "id": "a2-8",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "You ___ have told me earlier!",
      "correctAnswer": "should",
      "explanation": "'Should have' for past criticism/regret."
    },
    {
      "id": "a2-9",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I'm used to ___ up early.",
      "options": ["get", "getting", "got", "gotten"],
      "correctAnswer": 1,
      "explanation": "'Used to + -ing' for accustomed habits."
    },
    {
      "id": "a2-10",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "She suggested ___ to the cinema.",
      "correctAnswer": "going",
      "explanation": "'Suggest' is followed by gerund (-ing)."
    },
    {
      "id": "a2-11",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I have lived here ___ five years.",
      "options": ["since", "for", "from", "during"],
      "correctAnswer": 1,
      "explanation": "Use 'for' with a duration of time."
    },
    {
      "id": "a2-12",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "If it rains, we ___ inside.",
      "correctAnswer": "will stay",
      "explanation": "First conditional: 'if + present, will + verb'."
    },
    {
      "id": "a2-13",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "This is the ___ restaurant in the city.",
      "options": ["good", "better", "best", "more good"],
      "correctAnswer": 2,
      "explanation": "Superlative: 'the + -est' for short adjectives."
    },
    {
      "id": "a2-14",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "I enjoy ___ books in my free time.",
      "correctAnswer": "reading",
      "explanation": "'Enjoy' is followed by gerund (-ing)."
    },
    {
      "id": "a2-15",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "She denied ___ the cake.",
      "options": ["eat", "to eat", "eating", "ate"],
      "correctAnswer": 2,
      "explanation": "'Deny' is followed by gerund (-ing)."
    },
    {
      "id": "a2-16",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "You should ___ to your doctor.",
      "correctAnswer": "talk",
      "explanation": "'Should' is followed by base verb."
    },
    {
      "id": "a2-17",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I'm looking forward ___ your reply.",
      "options": ["to receive", "receiving", "receive", "to receiving"],
      "correctAnswer": 0,
      "explanation": "'Look forward to' + object (not -ing)."
    },
    {
      "id": "a2-18",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "They let me ___ the car.",
      "correctAnswer": "drive",
      "explanation": "'Let' is followed by object + base verb (no 'to')."
    },
    {
      "id": "a2-19",
      "difficulty": 3,
      "type": "multiple-choice",
      "prompt": "I regret ___ that to you.",
      "options": ["to say", "saying", "say", "said"],
      "correctAnswer": 1,
      "explanation": "'Regret' + gerund for something you did."
    },
    {
      "id": "a2-20",
      "difficulty": 3,
      "type": "fill-blank",
      "prompt": "My computer needs ___.",
      "correctAnswer": "repairing",
      "explanation": "'Need' + -ing (passive meaning)."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/a2.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/a2.json
git commit -m "feat: add A2 level questions (20 questions)"
```

---

## Task 5: Create B1 Questions File (20+ questions)

**Files:**
- Create: `public/questions/b1.json`

- [ ] **Step 1: Create b1.json with 20 B1 level questions**

```json
{
  "name": "B1 English Test",
  "level": "B1",
  "questions": [
    {
      "id": "b1-1",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "By the time you arrive, I ___ my homework.",
      "options": ["will finish", "will have finished", "finish", "have finished"],
      "correctAnswer": 1,
      "explanation": "Future perfect for action completed before a future time."
    },
    {
      "id": "b1-2",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "If I had known, I ___ you.",
      "options": ["would tell", "would have told", "told", "will tell"],
      "correctAnswer": 1,
      "explanation": "Third conditional: 'would have + past participle'."
    },
    {
      "id": "b1-3",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "The new policy, ___ was implemented last month, has caused controversy.",
      "options": ["which", "that", "who", "what"],
      "correctAnswer": 0,
      "explanation": "Non-defining relative clause uses 'which'."
    },
    {
      "id": "b1-4",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "I wish I ___ studied harder for the exam.",
      "correctAnswer": "had",
      "explanation": "'Wish + past perfect' for regret about past."
    },
    {
      "id": "b1-5",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "Despite the bad weather, they decided to ___ with the picnic.",
      "options": ["go on", "go ahead", "carry out", "carry on"],
      "correctAnswer": 1,
      "explanation": "'Go ahead' means to proceed with something."
    },
    {
      "id": "b1-6",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "The book ___ by millions of people worldwide.",
      "correctAnswer": "is read",
      "explanation": "Present passive: 'is + past participle'."
    },
    {
      "id": "b1-7",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "Not only ___ late, but he also forgot the documents.",
      "options": ["he was", "was he", "he is", "is he"],
      "correctAnswer": 0,
      "explanation": "'Not only' at start requires inversion after subject."
    },
    {
      "id": "b1-8",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "She accused him ___ her wallet.",
      "correctAnswer": "of stealing",
      "explanation": "'Accuse someone of + gerund'."
    },
    {
      "id": "b1-9",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "Hardly had we stepped outside ___ it started raining.",
      "options": ["than", "when", "then", "that"],
      "correctAnswer": 1,
      "explanation": "'Hardly...when' structure for sequential events."
    },
    {
      "id": "b1-10",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "The project was ___ due to lack of funding.",
      "correctAnswer": "abandoned",
      "explanation": "Past passive: 'was + past participle'."
    },
    {
      "id": "b1-11",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "___ I was tired, I continued working.",
      "options": ["Despite", "Although", "However", "Even"],
      "correctAnswer": 1,
      "explanation": "'Although' introduces a concession clause."
    },
    {
      "id": "b1-12",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "She objects ___ treated unfairly.",
      "correctAnswer": "to being",
      "explanation": "'Object to + being' (passive gerund)."
    },
    {
      "id": "b1-13",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "It's high time you ___ to bed.",
      "options": ["go", "went", "will go", "gone"],
      "correctAnswer": 1,
      "explanation": "'It's time' + past subjunctive for immediate action needed."
    },
    {
      "id": "b1-14",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "The report ___ by the committee tomorrow.",
      "correctAnswer": "will be published",
      "explanation": "Future passive: 'will be + past participle'."
    },
    {
      "id": "b1-15",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "___ having read the book, she failed the test.",
      "options": ["Although", "Despite", "Even though", "Spite of"],
      "correctAnswer": 1,
      "explanation": "'Despite + gerund' for concession."
    },
    {
      "id": "b1-16",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "He was ___ of stealing the money.",
      "correctAnswer": "accused",
      "explanation": "Past passive: 'was + past participle'."
    },
    {
      "id": "b1-17",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "Scarcely ___ entered the room when the phone rang.",
      "options": ["I had", "had I", "I did", "did I"],
      "correctAnswer": 1,
      "explanation": "'Scarcely...when' with inversion."
    },
    {
      "id": "b1-18",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "They succeeded in ___ the problem.",
      "correctAnswer": "solving",
      "explanation": "'Succeed in + gerund'."
    },
    {
      "id": "b1-19",
      "difficulty": 4,
      "type": "multiple-choice",
      "prompt": "The more you practice, ___ you'll become.",
      "options": ["the better", "better", "the best", "best"],
      "correctAnswer": 0,
      "explanation": "'The more...the better' comparative structure."
    },
    {
      "id": "b1-20",
      "difficulty": 4,
      "type": "fill-blank",
      "prompt": "Unless you ___ harder, you won't pass.",
      "correctAnswer": "study",
      "explanation": "'Unless' + present tense for future condition."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/b1.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/b1.json
git commit -m "feat: add B1 level questions (20 questions)"
```

---

## Task 6: Create B2 Questions File (20+ questions)

**Files:**
- Create: `public/questions/b2.json`

- [ ] **Step 1: Create b2.json with 20 B2 level questions**

```json
{
  "name": "B2 English Test",
  "level": "B2",
  "questions": [
    {
      "id": "b2-1",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Under no circumstances ___ reveal this information.",
      "options": ["you should", "should you", "you must", "must you"],
      "correctAnswer": 1,
      "explanation": "Negative inversion: 'should' comes before subject."
    },
    {
      "id": "b2-2",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "Had I known about the traffic, I ___ left earlier.",
      "correctAnswer": "would have",
      "explanation": "Third conditional inversion: 'Had I...' instead of 'If I had...'"
    },
    {
      "id": "b2-3",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "The proposal was rejected ___ the basis of the cost.",
      "options": ["on", "in", "at", "for"],
      "correctAnswer": 0,
      "explanation": "'On the basis of' is the correct preposition phrase."
    },
    {
      "id": "b2-4",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "But for your help, we ___ never succeeded.",
      "correctAnswer": "would",
      "explanation": "'But for' + noun = 'If it hadn't been for', triggers conditional."
    },
    {
      "id": "b2-5",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Little ___ know that this decision would change everything.",
      "options": ["did I", "I did", "I had", "had I"],
      "correctAnswer": 0,
      "explanation": "Negative inversion with 'Little'."
    },
    {
      "id": "b2-6",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "Contrary to expectations, the experiment ___.",
      "correctAnswer": "failed",
      "explanation": "Past simple for completed action that surprised."
    },
    {
      "id": "b2-7",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Not until much later ___ the truth.",
      "options": ["I learned", "did I learn", "I did learn", "learned I"],
      "correctAnswer": 1,
      "explanation": "'Not until' triggers time inversion."
    },
    {
      "id": "b2-8",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "There is no point ___ about the past.",
      "correctAnswer": "worrying",
      "explanation": "'There is no point (in) + gerund'."
    },
    {
      "id": "b2-9",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "___ the heavy rain, the match continued.",
      "options": ["Regardless", "Despite of", "In spite", "Although"],
      "correctAnswer": 0,
      "explanation": "'Regardless of' is correct; 'Despite' doesn't take 'of'."
    },
    {
      "id": "b2-10",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "The findings are consistent ___ previous research.",
      "correctAnswer": "with",
      "explanation": "'Consistent with' is the correct preposition."
    },
    {
      "id": "b2-11",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Only after careful consideration ___ our decision.",
      "options": ["we reached", "did we reach", "reached we", "we did reach"],
      "correctAnswer": 1,
      "explanation": "'Only after' triggers inversion."
    },
    {
      "id": "b2-12",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "She resented ___ for the mistake.",
      "correctAnswer": "being blamed",
      "explanation": "'Resent + being + past participle' (passive gerund)."
    },
    {
      "id": "b2-13",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Were I to win the lottery, I ___ around the world.",
      "options": ["would travel", "will travel", "travel", "traveled"],
      "correctAnswer": 0,
      "explanation": "'Were I' = 'If I were', triggers conditional."
    },
    {
      "id": "b2-14",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "The committee is composed ___ experts from various fields.",
      "correctAnswer": "of",
      "explanation": "'Composed of' is the correct phrase."
    },
    {
      "id": "b2-15",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "In no way ___ responsible for this outcome.",
      "options": ["I am", "am I", "I was", "was I"],
      "correctAnswer": 1,
      "explanation": "Negative inversion with 'In no way'."
    },
    {
      "id": "b2-16",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "We have no option but ___.",
      "correctAnswer": "to wait",
      "explanation": "'Have no option but + to-infinitive'."
    },
    {
      "id": "b2-17",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Such was his confidence that he ___ fail.",
      "options": ["refused to", "denied", "rejected", "declined"],
      "correctAnswer": 0,
      "explanation": "'Such was...that' structure with result clause."
    },
    {
      "id": "b2-18",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "The theory fails to account ___ these anomalies.",
      "correctAnswer": "for",
      "explanation": "'Account for' means 'explain'."
    },
    {
      "id": "b2-19",
      "difficulty": 5,
      "type": "multiple-choice",
      "prompt": "Nowhere in the document ___ mentioned.",
      "options": ["this is", "is this", "was this", "this was"],
      "correctAnswer": 1,
      "explanation": "Negative inversion with 'Nowhere'."
    },
    {
      "id": "b2-20",
      "difficulty": 5,
      "type": "fill-blank",
      "prompt": "We are committed ___ the highest standards.",
      "correctAnswer": "to maintaining",
      "explanation": "'Committed to + gerund'."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/b2.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/b2.json
git commit -m "feat: add B2 level questions (20 questions)"
```

---

## Task 7: Create C1 Questions File (20+ questions)

**Files:**
- Create: `public/questions/c1.json`

- [ ] **Step 1: Create c1.json with 20 C1 level questions**

```json
{
  "name": "C1 English Test",
  "level": "C1",
  "questions": [
    {
      "id": "c1-1",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "Given the complexity of the issue, a nuanced approach is ___.",
      "options": ["called for", "needed", "required", "demanded"],
      "correctAnswer": 0,
      "explanation": "'Called for' is idiomatic in formal contexts."
    },
    {
      "id": "c1-2",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The hypothesis stands ___ scrutiny.",
      "correctAnswer": "up to",
      "explanation": "'Stand up to' means withstands."
    },
    {
      "id": "c1-3",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "The evidence would suggest otherwise, ___ the latest study.",
      "options": ["according to", "pending", "notwithstanding", "contrary to"],
      "correctAnswer": 2,
      "explanation": "'Notwithstanding' = despite, formal register."
    },
    {
      "id": "c1-4",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "His argument fails to ___ under cross-examination.",
      "correctAnswer": "hold",
      "explanation": "'Hold' means remain valid or convincing."
    },
    {
      "id": "c1-5",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "The proposition is, ___ best, highly controversial.",
      "options": ["at", "in", "on", "to"],
      "correctAnswer": 0,
      "explanation": "'At best' is the correct idiom."
    },
    {
      "id": "c1-6",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The committee's decision is ___ to appeal.",
      "correctAnswer": "open",
      "explanation": "'Open to appeal' = can be challenged."
    },
    {
      "id": "c1-7",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "___ the merit of his argument, the conclusion is flawed.",
      "options": ["Granting", "Granted", "Allowing", "Given that"],
      "correctAnswer": 1,
      "explanation": "'Granted' introduces concession in formal argument."
    },
    {
      "id": "c1-8",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The repercussions are ___ to be underestimated.",
      "correctAnswer": "not",
      "explanation": "'Not to be underestimated' = must be taken seriously."
    },
    {
      "id": "c1-9",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "___ mention of his name, she burst into tears.",
      "options": ["Upon", "At", "On", "In"],
      "correctAnswer": 0,
      "explanation": "'Upon mention' is formal; 'At the mention' also works."
    },
    {
      "id": "c1-10",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The findings run ___ to established theory.",
      "correctAnswer": "counter",
      "explanation": "'Run counter to' = contradict."
    },
    {
      "id": "c1-11",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "Barring unforeseen circumstances, the project will ___ schedule.",
      "options": ["stay on", "remain on", "keep to", "adhere to"],
      "correctAnswer": 1,
      "explanation": "'Remain on schedule' is idiomatic."
    },
    {
      "id": "c1-12",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "His expertise lies ___ Renaissance art.",
      "correctAnswer": "in",
      "explanation": "'Lie in' = be found in."
    },
    {
      "id": "c1-13",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "The consequences ___ far-reaching.",
      "options": ["proved", "were proved", "proved to be", "were proving to be"],
      "correctAnswer": 2,
      "explanation": "'Prove to be' = turn out to be."
    },
    {
      "id": "c1-14",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The theory rests ___ shaky assumptions.",
      "correctAnswer": "on",
      "explanation": "'Rest on' = be based on."
    },
    {
      "id": "c1-15",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "___ all accounts, the meeting was a success.",
      "options": ["By", "On", "In", "At"],
      "correctAnswer": 0,
      "explanation": "'By all accounts' = according to everyone."
    },
    {
      "id": "c1-16",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The conclusion does not ___ from the premises.",
      "correctAnswer": "follow",
      "explanation": "'Follow from' = logically result from."
    },
    {
      "id": "c1-17",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "The proposal was ___ unanimously.",
      "options": ["rejected", "denied", "refused", "declined"],
      "correctAnswer": 0,
      "explanation": "'Reject' is used for proposals in formal contexts."
    },
    {
      "id": "c1-18",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "His argument ___ to several logical fallacies.",
      "correctAnswer": "is prey",
      "explanation": "'Fall prey to' = be vulnerable to."
    },
    {
      "id": "c1-19",
      "difficulty": 6,
      "type": "multiple-choice",
      "prompt": "___ the circumstances, we proceeded as planned.",
      "options": ["Given", "Giving", "To give", "In giving"],
      "correctAnswer": 0,
      "explanation": "'Given' = considering."
    },
    {
      "id": "c1-20",
      "difficulty": 6,
      "type": "fill-blank",
      "prompt": "The results are ___ with previous studies.",
      "correctAnswer": "consistent",
      "explanation": "'Consistent with' = align with."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/c1.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/c1.json
git commit -m "feat: add C1 level questions (20 questions)"
```

---

## Task 8: Create C2 Questions File (20+ questions)

**Files:**
- Create: `public/questions/c2.json`

- [ ] **Step 1: Create c2.json with 20 C2 level questions**

```json
{
  "name": "C2 English Test",
  "level": "C2",
  "questions": [
    {
      "id": "c2-1",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "The politician's remarks were ___ obfuscation.",
      "options": ["nothing more than", "nothing less than", "nothing but", "merely"],
      "correctAnswer": 0,
      "explanation": "'Nothing more than' = simply, purely."
    },
    {
      "id": "c2-2",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The philosophy ___ itself to multiple interpretations.",
      "correctAnswer": "lends",
      "explanation": "'Lend itself to' = be suitable for."
    },
    {
      "id": "c2-3",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "___ his reputation, his argument lacks substance.",
      "options": ["Notwithstanding", "Beguiling", "For all", "Despite"],
      "correctAnswer": 2,
      "explanation": "'For all' = despite, followed by noun phrase."
    },
    {
      "id": "c2-4",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The legislation ___ far-reaching implications.",
      "correctAnswer": "carries",
      "explanation": "'Carry implications' = have consequences."
    },
    {
      "id": "c2-5",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "His critique ___ to the heart of the matter.",
      "options": ["goes", "gets", "penetrates", "reaches"],
      "correctAnswer": 1,
      "explanation": "'Get to the heart of' = address the core issue."
    },
    {
      "id": "c2-6",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The theory ___ under close examination.",
      "correctAnswer": "crumbles",
      "explanation": "'Crumble under' = fail when subjected to."
    },
    {
      "id": "c2-7",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "The proposal, ___ accepted, would revolutionize the industry.",
      "options": ["were it to be", "if it were", "should it be", "were it"],
      "correctAnswer": 0,
      "explanation": "Conditional inversion with passive construction."
    },
    {
      "id": "c2-8",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "Her arguments ___ considerable weight.",
      "correctAnswer": "carry",
      "explanation": "'Carry weight' = be significant/influential."
    },
    {
      "id": "c2-9",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "___ thorough investigation, the matter remains unresolved.",
      "options": ["Despite", "Notwithstanding", "In spite of", "After"],
      "correctAnswer": 1,
      "explanation": "'Notwithstanding' = despite, more formal."
    },
    {
      "id": "c2-10",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The analysis ___ several critical flaws.",
      "correctAnswer": "lays bare",
      "explanation": "'Lay bare' = reveal/expose."
    },
    {
      "id": "c2-11",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "The outcome is ___ ___ doubt.",
      "options": ["beyond, reasonable", "outside, any", "without, question", "open, to"],
      "correctAnswer": 0,
      "explanation": "'Beyond reasonable doubt' is a legal phrase."
    },
    {
      "id": "c2-12",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "His testimony ___ the prosecution's case.",
      "correctAnswer": "undermined",
      "explanation": "'Undermine' = weaken."
    },
    {
      "id": "c2-13",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "___ the merits of his argument, his tone was inappropriate.",
      "options": ["Leaving aside", "Putting aside", "Disregarding", "Ignoring"],
      "correctAnswer": 0,
      "explanation": "'Leave aside' = temporarily not consider."
    },
    {
      "id": "c2-14",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The policy ___ itself to criticism.",
      "correctAnswer": "opens",
      "explanation": "'Open itself to' = make itself vulnerable to."
    },
    {
      "id": "c2-15",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "___ claim, the evidence suggests otherwise.",
      "options": ["Contrary to his", "Opposing his", "Against his", "Not withstanding his"],
      "correctAnswer": 0,
      "explanation": "'Contrary to' = opposing."
    },
    {
      "id": "c2-16",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The consequences ___ his actions are severe.",
      "correctAnswer": "attending",
      "explanation": "'Attending' = associated with (formal)."
    },
    {
      "id": "c2-17",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "His argument ___ on several flawed assumptions.",
      "options": ["is predicated", "predicates", "relies", "depends"],
      "correctAnswer": 0,
      "explanation": "'Be predicated on' = be based on (formal)."
    },
    {
      "id": "c2-18",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "The debate ___ around the interpretation of the clause.",
      "correctAnswer": "revolves",
      "explanation": "'Revolve around' = center on."
    },
    {
      "id": "c2-19",
      "difficulty": 7,
      "type": "multiple-choice",
      "prompt": "___ the weight of evidence, the jury found him guilty.",
      "options": ["Given", "Considering", "In light of", "All"],
      "correctAnswer": 2,
      "explanation": "'In light of' = considering (formal)."
    },
    {
      "id": "c2-20",
      "difficulty": 7,
      "type": "fill-blank",
      "prompt": "His resignation speaks ___ about the company's state.",
      "correctAnswer": "volumes",
      "explanation": "'Speak volumes' = convey a lot (idiom)."
    }
  ]
}
```

- [ ] **Step 2: Verify JSON is valid**

Run: `cat public/questions/c2.json | jq .`
Expected: Valid JSON output

- [ ] **Step 3: Commit**

```bash
git add public/questions/c2.json
git commit -m "feat: add C2 level questions (20 questions)"
```

---

## Task 9: Update TestProvider with Adaptive State

**Files:**
- Modify: `components/test/TestProvider.tsx`
- Test: `__tests__/unit/TestProvider.test.tsx` (create if not exists)

- [ ] **Step 1: Add new state properties to TestProvider**

```typescript
// In components/test/TestProvider.tsx

interface TestState {
  testType: TestType | null
  level?: CEFRLevel
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<string, Answer>
  isComplete: boolean
  result?: TestResult

  // NEW: Adaptive placement test state
  currentLevel: CEFRLevel | null
  questionsBank: Map<string, Question[]>  // level -> questions
}

export function TestProvider({ children }: TestProviderProps) {
  const [state, setState] = useState<TestState>({
    testType: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: new Map(),
    isComplete: false,
    currentLevel: null,
    questionsBank: new Map(),
  })

  // ... rest of existing code
}
```

- [ ] **Step 2: Add loadAllLevelQuestions function**

```typescript
const loadAllLevelQuestions = useCallback(async () => {
  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const bank = new Map<string, Question[]>()

  for (const level of levels) {
    try {
      const response = await fetch(`/questions/${level.toLowerCase()}.json`)
      if (!response.ok) throw new Error(`Failed to load ${level}`)
      const data = await response.json()
      bank.set(level, data.questions)
    } catch (error) {
      console.error(`Failed to load ${level} questions:`, error)
      throw error
    }
  }

  setState(prev => ({ ...prev, questionsBank: bank }))
}, [])
```

- [ ] **Step 3: Add getRandomQuestionsFromLevel function**

```typescript
const getRandomQuestionsFromLevel = useCallback((level: CEFRLevel, count: number): Question[] => {
  const levelQuestions = state.questionsBank.get(level)
  if (!levelQuestions) {
    throw new Error(`No questions found for level ${level}`)
  }

  if (levelQuestions.length < count) {
    console.warn(`Only ${levelQuestions.length} questions available for ${level}, using all`)
  }

  return getRandomQuestions(levelQuestions, count)
}, [state.questionsBank])
```

- [ ] **Step 4: Add loadNextLevel function**

```typescript
const loadNextLevel = useCallback(async () => {
  if (!state.currentLevel) return

  const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
  const currentIndex = levels.indexOf(state.currentLevel)

  if (currentIndex >= levels.length - 1) {
    // C2 is complete
    setState(prev => ({ ...prev, isComplete: true, result: {
      testType: 'placement',
      level: 'C2',
      recommendations: generateRecommendations('C2'),
      completedAt: new Date(),
    }})
    return
  }

  const nextLevel = levels[currentIndex + 1]
  const nextQuestions = getRandomQuestionsFromLevel(nextLevel, 10)

  setState(prev => ({
    ...prev,
    currentLevel: nextLevel,
    questions: nextQuestions,
    currentQuestionIndex: 0,
    answers: new Map(),
  }))
}, [state.currentLevel, getRandomQuestionsFromLevel])
```

- [ ] **Step 5: Add checkCurrentLevelPassed function**

```typescript
const checkCurrentLevelPassed = useCallback((): boolean => {
  if (!state.currentLevel || state.questions.length === 0) return false

  return checkLevelPassThreshold(state.questions, state.answers)
}, [state.currentLevel, state.questions, state.answers])
```

- [ ] **Step 6: Update startTest for placement**

```typescript
const startTest = useCallback(async (testType: TestType, level?: CEFRLevel) => {
  if (testType === 'placement') {
    // NEW: Load all level questions for adaptive test
    await loadAllLevelQuestions()

    // Start with A0
    const a0Questions = state.questionsBank.get('A0')
    if (!a0Questions) {
      throw new Error('A0 questions not loaded')
    }

    const selectedQuestions = getRandomQuestions(a0Questions, 10)

    setState({
      testType: 'placement',
      level: undefined,
      questions: selectedQuestions,
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
      currentLevel: 'A0',
      questionsBank: state.questionsBank,
    })
  } else if (level) {
    // Existing level test logic (unchanged)
    const levelMap: Record<CEFRLevel, string> = {
      'A0': 'a0',
      'A1': 'a1',
      'A2': 'a2',
      'B1': 'b1',
      'B2': 'b2',
      'C1': 'c1',
      'C2': 'c2',
    }
    const response = await fetch(`/questions/${levelMap[level]}.json`)
    const data = await response.json()
    const questions = getRandomQuestions(data.questions, 10)

    setState({
      testType: 'level',
      level,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
      currentLevel: null,
      questionsBank: new Map(),
    })
  }
}, [loadAllLevelQuestions, state.questionsBank])
```

- [ ] **Step 7: Update TestContextType**

```typescript
interface TestContextType extends TestState {
  startTest: (testType: TestType, level?: CEFRLevel) => Promise<void>
  answerQuestion: (questionId: string, answer: Answer) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeTest: () => void
  restart: () => void

  // NEW: Adaptive test methods
  loadNextLevel: () => Promise<void>
  checkCurrentLevelPassed: () => boolean
}

// Update context value provider
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
    loadNextLevel,
    checkCurrentLevelPassed,
  }}
>
```

- [ ] **Step 8: Write test for new state**

```typescript
// In __tests__/unit/TestProvider.test.tsx
import { renderHook, act } from '@testing-library/react'
import { TestProvider, useTest } from '@/components/test/TestProvider'

describe('TestProvider Adaptive State', () => {
  it('should initialize with null currentLevel', () => {
    const { result } = renderHook(() => useTest(), { wrapper: TestProvider })

    expect(result.current.currentLevel).toBeNull()
  })

  it('should set currentLevel to A0 when starting placement test', async () => {
    const { result } = renderHook(() => useTest(), { wrapper: TestProvider })

    await act(async () => {
      await result.current.startTest('placement')
    })

    expect(result.current.currentLevel).toBe('A0')
  })
})
```

- [ ] **Step 9: Run tests to verify**

Run: `npm test -- TestProvider`
Expected: PASS for new state tests

- [ ] **Step 10: Commit**

```bash
git add components/test/TestProvider.tsx __tests__/unit/TestProvider.test.tsx
git commit -m "feat: add adaptive state to TestProvider"
```

---

## Task 10: Create AdaptivePlacementTest Component

**Files:**
- Create: `components/test/AdaptivePlacementTest.tsx`
- Test: `__tests__/integration/adaptive-placement.test.tsx`

- [ ] **Step 1: Create AdaptivePlacementTest component**

```typescript
// In components/test/AdaptivePlacementTest.tsx
'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export function AdaptivePlacementTest() {
  const {
    questions,
    currentQuestionIndex,
    currentLevel,
    answers,
    checkCurrentLevelPassed,
    loadNextLevel,
    completeTest,
  } = useTest()

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleLevelComplete = async () => {
    const passed = checkCurrentLevelPassed()

    if (passed) {
      // Load next level
      await loadNextLevel()
    } else {
      // Show result with current level
      completeTest()
    }
  }

  if (!currentQuestion || !currentLevel) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p>Loading...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Level-aware progress */}
      <div className="mb-4 text-center text-sm text-slate-600">
        {currentLevel} Level • Question {currentQuestionIndex + 1} of {questions.length}
      </div>

      <ProgressBar
        current={currentQuestionIndex + 1}
        total={questions.length}
      />

      <QuestionCard
        question={currentQuestion}
        answer={answers.get(currentQuestion.id)}
        onAnswerChange={(answer) => {
          // Handled by TestProvider
          console.log('Answer changed:', answer)
        }}
      />

      {isLastQuestion ? (
        <div className="mt-6 flex justify-center gap-4">
          <Button
            onClick={handleLevelComplete}
            size="lg"
          >
            Complete Level
          </Button>
        </div>
      ) : (
        <NavigationButtons />
      )}
    </div>
  )
}
```

- [ ] **Step 2: Write integration test**

```typescript
// In __tests__/integration/adaptive-placement.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { AdaptivePlacementTest } from '@/components/test/AdaptivePlacementTest'
import { TestProvider } from '@/components/test/TestProvider'

describe('AdaptivePlacementTest', () => {
  it('should display current level and question progress', async () => {
    render(
      <TestProvider>
        <AdaptivePlacementTest />
      </TestProvider>
    )

    await waitFor(() => {
      expect(screen.getByText(/A0 Level/)).toBeInTheDocument()
      expect(screen.getByText(/Question 1 of 10/)).toBeInTheDocument()
    })
  })

  it('should show Complete Level button on last question', async () => {
    render(
      <TestProvider>
        <AdaptivePlacementTest />
      </TestProvider>
    )

    await waitFor(() => {
      expect(screen.getByText('Complete Level')).toBeInTheDocument()
    })
  })
})
```

- [ ] **Step 3: Run integration tests**

Run: `npm test -- adaptive-placement`
Expected: PASS for integration tests

- [ ] **Step 4: Commit**

```bash
git add components/test/AdaptivePlacementTest.tsx __tests__/integration/adaptive-placement.test.tsx
git commit -m "feat: add AdaptivePlacementTest component"
```

---

## Task 11: Update Routing to Use AdaptivePlacementTest

**Files:**
- Modify: `components/test/page.tsx`

- [ ] **Step 1: Update page.tsx to route to AdaptivePlacementTest**

```typescript
// In components/test/page.tsx
'use client'

import { useTest } from '@/components/test/TestProvider'
import { HomePage } from '@/components/test/HomePage'
import { AdaptivePlacementTest } from '@/components/test/AdaptivePlacementTest'
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
    return <AdaptivePlacementTest />
  }

  return <LevelTest />
}
```

- [ ] **Step 2: Verify application builds**

Run: `npm run build`
Expected: Build succeeds

- [ ] **Step 3: Commit**

```bash
git add components/test/page.tsx
git commit -m "feat: route placement test to AdaptivePlacementTest"
```

---

## Task 12: Archive Old Question Files

**Files:**
- Archive: `public/questions/placement-test.json`, `public/questions/a0-a1.json`
- Archive: `components/test/PlacementTest.tsx`

- [ ] **Step 1: Create archive directory and move old files**

```bash
mkdir -p public/questions/.archive
mv public/questions/placement-test.json public/questions/.archive/
mv public/questions/a0-a1.json public/questions/.archive/
```

- [ ] **Step 2: Archive old PlacementTest component**

```bash
mkdir -p components/test/.archive
mv components/test/PlacementTest.tsx components/test/.archive/
```

- [ ] **Step 3: Commit**

```bash
git add public/questions components/test
git commit -m "chore: archive old placement test files"
```

---

## Task 13: Manual Testing and Final Verification

**Files:**
- None (manual testing)

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Server starts on localhost:3000

- [ ] **Step 2: Test A0 failure flow**

1. Navigate to http://localhost:3000
2. Click "Start Placement Test"
3. Answer questions to get < 70% on A0
4. Click "Complete Level"
5. Verify: Shows "Your level is A0"

- [ ] **Step 3: Test multi-level progression**

1. Navigate to http://localhost:3000
2. Click "Start Placement Test"
3. Answer A0 questions to get ≥ 70%
4. Click "Complete Level"
5. Verify: Loads A1 questions with "A1 Level • Question 1 of 10"

- [ ] **Step 4: Test C2 completion**

1. Use browser console to force C2 level and pass
2. Complete all C2 questions correctly
3. Verify: Shows "C2 — максимальный уровень!"

- [ ] **Step 5: Test randomization**

1. Reload page and start test again
2. Compare first 3 questions with previous run
3. Verify: Questions are different (randomization working)

- [ ] **Step 6: Test Level Tests still work**

1. Click "Level Test" → "Level A0"
2. Answer all questions
3. Verify: Level test works independently (not adaptive)

- [ ] **Step 7: Run all tests**

Run: `npm test`
Expected: All tests pass

- [ ] **Step 8: Production build test**

Run: `npm run build && npm start`
Expected: Production build works

---

## Task 14: Update Documentation

**Files:**
- Update: `README.md` (if exists)
- Update: `CLAUDE.md` (if needed)

- [ ] **Step 1: Update README with adaptive test info**

```markdown
# English Level Test

Placement test now uses adaptive assessment:
- Starts at A0, progresses through levels
- Stops when student fails a level (70% threshold)
- Each level uses 10 randomly selected questions from a bank of 20+
```

- [ ] **Step 2: Commit**

```bash
git add README.md CLAUDE.md
git commit -m "docs: update documentation for adaptive placement test"
```

---

## Summary Checklist

After completing all tasks:

- [ ] 7 new question files created (a0-c2.json) with 20+ questions each
- [ ] Utility functions added (getRandomQuestions, checkLevelPassThreshold)
- [ ] TestProvider updated with adaptive state and methods
- [ ] AdaptivePlacementTest component created
- [ ] Routing updated to use new component
- [ ] Old files archived
- [ ] All tests passing
- [ ] Manual testing complete
- [ ] Documentation updated

**Total commits:** ~14
**Estimated time:** 4-6 hours
