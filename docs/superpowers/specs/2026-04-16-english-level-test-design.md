# English Level Test Platform — Design Document

**Date:** 2026-04-16
**Status:** Approved
**Version:** 1.0

## 1. Overview

### Project Goal
Create a web application for testing English language proficiency according to the CEFR scale (A0-C2).

### Core Features (MVP)
1. **Placement Test** — adaptive test to determine user's level automatically
2. **Level-Specific Tests** — separate tests for each CEFR level (A0-A1, A2, B1, B2, C1, C2)
3. **Results Display** — show level determination and recommendations

### Target Audience
- All categories: from complete beginners (A0) to advanced learners (C2)
- Desktop users only (mobile support planned for future)

### Tech Stack
- **Framework:** Next.js 15 with App Router
- **UI Library:** React 19 + TypeScript
- **Styling:** Tailwind CSS
- **Components:** shadcn/ui

---

## 2. System Architecture

### Project Structure
```
ai-english/
├── app/
│   ├── page.tsx                 # Home page
│   ├── layout.tsx               # Root layout
│   └── globals.css              # Global styles
├── components/
│   ├── ui/                      # shadcn/ui components
│   ├── PlacementTest.tsx        # Placement test component
│   ├── LevelTest.tsx            # Level-specific test component
│   ├── QuestionCard.tsx         # Universal question card
│   ├── ProgressBar.tsx          # Progress indicator
│   ├── Results.tsx              # Results screen
│   └── NavigationButtons.tsx    # Next/Previous navigation
├── lib/
│   ├── questions/               # Question data (JSON)
│   │   ├── placement-test.json
│   │   ├── a0-a1.json
│   │   ├── a2.json
│   │   ├── b1.json
│   │   ├── b2.json
│   │   ├── c1.json
│   │   └── c2.json
│   ├── context/
│   │   └── TestContext.tsx      # Global test state
│   ├── types.ts                 # TypeScript types
│   └── utils.ts                 # Helper functions
└── public/
    └── (static assets)
```

### Architectural Pattern
- **Single Page Application (SPA)** within a single Next.js page
- **State Management:** React Context (`TestContext`)
- **Data Storage:** JSON files for questions, `localStorage` for results
- **Routing:** Client-side navigation within the page

---

## 3. Components

### TestProvider (Context)
Manages global test state across the application.

**State:**
```typescript
interface TestState {
  testType: 'placement' | 'level'
  level?: CEFRLevel
  questions: Question[]
  currentQuestionIndex: number
  answers: Map<questionId, Answer>
  isComplete: boolean
  result?: TestResult
}
```

### HomePage
Entry point where users select test type.

**Props:** None
**State:** None (selection handled by TestProvider)

**Responsibilities:**
- Display test type options (Placement / Level-specific)
- If Level selected, show level selector
- Initiate selected test

### PlacementTest
Adaptive test that determines user's level.

**Props:** None
**State:** Uses TestContext

**Responsibilities:**
- Load placement test questions
- Implement adaptive algorithm (start medium, adjust difficulty)
- 20-30 questions total
- Determine CEFR level based on pattern of correct/incorrect answers

### LevelTest
Fixed test for a specific CEFR level.

**Props:** `level: CEFRLevel`
**State:** Uses TestContext

**Responsibilities:**
- Load questions for specified level
- Present 30-40 questions
- Calculate pass/fail (>=70% correct = pass)

### QuestionCard (Universal Component)
Displays a single question based on its type.

**Props:**
```typescript
interface QuestionCardProps {
  question: Question
  answer: Answer
  onAnswerChange: (answer: Answer) => void
}
```

**Question Types:**
- `multiple-choice`: Select one correct option
- `fill-blank`: Type missing word
- `matching`: Connect pairs (drag-drop or click-to-match)
- `open-ended`: Free text input

**Responsibilities:**
- Render appropriate input UI based on question type
- Validate input before allowing submission
- Display feedback on attempted navigation without answer

### ProgressBar
Visual indicator of test progress.

**Props:**
```typescript
interface ProgressBarProps {
  current: number
  total: number
}
```

**Responsibilities:**
- Display progress bar with percentage
- Show "Question X of Y" text

### Results
Displays test completion results.

**Props:**
```typescript
interface ResultsProps {
  result: TestResult
  onRestart: () => void
}
```

**Responsibilities:**
- For Placement Test: Show determined CEFR level
- For Level Test: Show percentage and pass/fail
- Display recommendations for improvement
- Offer "Take Another Test" option

### NavigationButtons
Controls test progression.

**Props:**
```typescript
interface NavigationButtonsProps {
  onPrevious: () => void
  onNext: () => void
  canGoBack: boolean
  canGoForward: boolean
  isAnswerValid: boolean
}
```

**Responsibilities:**
- Enable/disable Previous button based on position
- Enable/disable Next button based on answer validity
- Show validation message if Next clicked without valid answer

---

## 4. Data Flow

### User Journey

```
1. HomePage → User selects test type (Placement or Level)
   ↓
2. Test loads questions from appropriate JSON file
   ↓
3. QuestionCard renders first question
   ↓
4. User enters answer → stored in TestContext
   ↓
5. NavigationButtons validates answer
   ↓
6. If valid, advance to next question
   ↓
7. Repeat steps 3-6 for all questions
   ↓
8. Results component calculates and displays outcome
```

### Question Data Structure (JSON)

```typescript
interface Question {
  id: string
  type: 'multiple-choice' | 'fill-blank' | 'matching' | 'open-ended'
  difficulty: 1-6  // Maps to A0-C2
  prompt: string
  options?: string[]  // For multiple-choice
  pairs?: Array<{left: string, right: string}>  // For matching
  correctAnswer: string | string[]  // Expected answer
  explanation?: string  // Shown in results
}
```

### Result Calculation

**Placement Test Algorithm:**
- Start with A2-level questions
- If >=80% correct on first 5, move to B1
- If <60% correct, move down to A1
- Continue adaptive adjustment
- Final level determined by highest consistently-passed tier

**Level Test Algorithm:**
```
score = (correctAnswers / totalQuestions) * 100
pass = score >= 70
```

---

## 5. Error Handling

| Error Type | Scenario | Handling Strategy | User Message |
|------------|----------|-------------------|--------------|
| **Load Failure** | JSON file fails to load | Show retry button, log to console | "Failed to load questions. Please try again." |
| **Invalid Input** | User submits without answering | Block navigation, highlight required field | "Please answer the question before continuing." |
| **Storage Failure** | localStorage unavailable | Silently fail, results stored in memory only | None (transparent) |
| **Unexpected Error** | Any runtime error | Error Boundary catches, shows friendly screen | "Something went wrong. Please refresh the page." |

### Error Boundary
```typescript
<ErrorBoundary fallback={<ErrorScreen />}>
  <App />
</ErrorBoundary>
```

---

## 6. Testing Strategy

### Unit Tests (Vitest)
- Result calculation functions
- Answer validation logic
- Placement level determination algorithm
- CEFR level mapping utilities

### Component Tests (React Testing Library)
- Component rendering
- Form interactions
- State updates in TestContext
- Navigation between questions

### Manual E2E Testing
- Complete Placement Test flow
- Complete Level Test flow for each level
- All question types functionality
- Result display accuracy

### Tools
- **Vitest** for unit tests
- **React Testing Library** for component tests
- **Manual browser testing** (Chrome/Edge) for MVP
- **Playwright** for future E2E automation

### Test Timing
- Unit tests: Write alongside implementation
- Component tests: Write as components are added
- E2E tests: Add in future iteration

---

## 7. Visual Design

### Style: Classic Academic
- **Color Palette:** Navy blue, cream, dark gray, accent gold
- **Typography:** Clean serif for headings, sans-serif for body
- **Layout:** Centered content, generous whitespace
- **Tone:** Professional, educational, trustworthy

### Design Inspirations
- Cambridge English Test
- Oxford Placement Test
- British Council English level test

---

## 8. Future Enhancements (Out of Scope for MVP)

- User accounts and login
- Save test history to database
- Mobile responsive design
- Practice exercises for weak areas
- Spoken English assessment
- Writing samples with AI grading
- Progress tracking over time
- Study recommendations based on results

---

## 9. Success Criteria

The MVP is considered successful when:
1. User can complete a full Placement Test and receive a CEFR level
2. User can complete any Level Test and receive pass/fail result
3. All question types (multiple-choice, fill-blank, matching, open-ended) work correctly
4. Results are calculated accurately
5. UI is clean, functional, and follows classic academic style
6. Application works on desktop browsers (Chrome, Edge, Firefox, Safari)

---

**End of Design Document**
