# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

English Level Test Platform - web application for testing English language proficiency according to the CEFR scale (A0-C2).

**Key feature:** Adaptive placement test that sequentially progresses through levels (A0 → A1 → A2 → B1 → B2 → C1 → C2), stopping when the student fails a level (70% threshold).

## Development Commands

```bash
# Start development server
npm run dev

# Run tests
npm run test

# Build for production
npm run build

# Start production server
npm start
```

**Note:** Turbopack on Windows sometimes has CSS processing issues. If you see errors, delete the `.next` folder and restart the dev server.

## Architecture

### High-Level Structure

```
app/           → Next.js app directory (layout.tsx, page.tsx)
components/    → React components
  test/        → Test-related components (TestProvider, AdaptivePlacementTest, etc.)
  ui/          → shadcn/ui components
lib/utils/     → Utility functions (testCalculation.ts)
public/questions/ → Question JSON files (a0-c2.json)
```

### Key Components

**TestProvider** (`components/test/TestProvider.tsx`)
- React Context provider managing global test state
- Contains adaptive placement test logic
- Key methods: `startTest()`, `loadNextLevel()`, `checkLevelPassed()`, `completeTest()`
- State includes: `currentLevel`, `questionsBank`, `questions`, `answers`, `isComplete`

**AdaptivePlacementTest** (`components/test/AdaptivePlacementTest.tsx`)
- Handles sequential level progression (A0 → A1 → A2 → B1 → B2 → C1 → C2)
- Shows level-aware progress: "A2 Level • Question 5 of 10"
- Displays "Next Level" button when passing (≥70%) or results when failing
- Used instead of PlacementTest for placement test flow

**testCalculation.ts** (`lib/utils/testCalculation.ts`)
- `getRandomQuestions<T>()`: Fisher-Yates shuffle for randomization
- `checkLevelPassThreshold()`: Returns true if score ≥ 70%
- `calculateCorrectCount()`: Helper for counting correct answers

### Question Files

Located in `public/questions/`:
- `a0.json`, `a1.json`, `a2.json`, `b1.json`, `b2.json`, `c1.json`, `c2.json`
- Each contains 20 questions at appropriate difficulty level
- Format: `{name, level, questions: [{id, difficulty, type, prompt, options/correctAnswer, explanation}]}`

### Data Flow for Adaptive Placement Test

1. User clicks "Start Placement Test" → `TestProvider.startTest('placement')`
2. Load all level files into `questionsBank` Map
3. Start at A0 level, select 10 random questions
4. User answers all 10 questions
5. Check if passed (≥70% correct):
   - If passed AND not C2: `loadNextLevel()` → advances to next level
   - If passed AND is C2: Complete test, show "C2 — максимальный уровень!"
   - If failed: Complete test, show "Your level is {Level}"

## Tech Stack

- Next.js 15.2.4 with Turbopack
- React 19
- TypeScript
- Tailwind CSS v3 (NOT v4 - downgraded for compatibility)
- shadcn/ui components
- Vitest for testing

## Important Patterns

### State Management
- Use React Context (TestProvider) for global test state
- Answers stored as `Map<string, Answer>` keyed by question ID
- Use `useTest()` hook to access test context in components

### Question Types
- `multiple-choice`: correctAnswer is number (index of correct option)
- `fill-blank`: correctAnswer is string (case-insensitive comparison)
- `matching`: pairs array with left/right strings
- `open-ended`: correctAnswer is string array (acceptable answers)

### Adaptive Test Constants
```typescript
const LEVEL_ORDER: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
const LEVEL_PASS_THRESHOLD = 0.7  // 70%
const QUESTIONS_PER_LEVEL = 10
```

## When Working on This Project

1. **For adaptive test changes:** Focus on `TestProvider.tsx` and `AdaptivePlacementTest.tsx`
2. **For question content:** Edit JSON files in `public/questions/`
3. **For scoring logic:** Edit `lib/utils/testCalculation.ts`
4. **For UI changes:** Edit components in `components/test/`
5. **Always test** the adaptive flow after changes (start placement test, verify level progression)

## Known Issues

1. Turbopack on Windows: CSS processing sometimes fails. Solution: `rm -rf .next && npm run dev`
2. Port 3000 conflict: Server automatically uses 3001 if 3000 is busy

## Project Documentation

- `README.md` - User-facing documentation
- `docs/PROJECT_SUMMARY.md` - Detailed project documentation
- `docs/superpowers/specs/` - Design specifications
- `docs/superpowers/plans/` - Implementation plans
