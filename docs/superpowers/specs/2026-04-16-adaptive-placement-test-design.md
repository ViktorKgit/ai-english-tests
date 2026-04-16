# Adaptive Placement Test Design

**Date:** 2026-04-16
**Status:** Approved

## Overview

Redesign the placement test to be a sequential adaptive assessment that evaluates students level by level (A0 → A1 → A2 → B1 → B2 → C1 → C2), stopping when they fail a level or complete C2. Each test session uses randomly selected questions from a larger question bank.

## Requirements

### Functional Requirements
1. **Sequential Level Testing:** Test starts at A0, progresses to next level only if student passes (≥70%)
2. **Stop on Failure:** If student fails a level, immediately show their determined level and stop
3. **Randomized Questions:** Each level randomly selects 10 questions from a bank of 20+ questions
4. **Progress Display:** Show current level and question progress (e.g., "A2 Level • Question 5 of 10")
5. **Fixed Threshold:** 70% correct answers (7 of 10) required to advance to next level
6. **Maximum Level:** C2 is the highest achievable level

### Non-Functional Requirements
1. **Performance:** Load all question files at start (~50-100KB for 140 questions)
2. **Simplicity:** Client-side only, no backend changes required
3. **Maintainability:** Separate question files per level for easy content management

## Architecture

### File Structure

```
public/questions/
  ├── a0.json          (20+ questions, difficulty 1)
  ├── a1.json          (20+ questions, difficulty 2)
  ├── a2.json          (20+ questions, difficulty 3)
  ├── b1.json          (20+ questions, difficulty 4)
  ├── b2.json          (20+ questions, difficulty 5)
  ├── c1.json          (20+ questions, difficulty 6)
  └── c2.json          (20+ questions, difficulty 7)
```

**Note:** Old `placement-test.json` and `a0-a1.json` files will be replaced or archived.

### Question JSON Format

Each file follows the existing format:
```json
{
  "name": "A0 English Test",
  "level": "A0",
  "questions": [
    {
      "id": "a0-1",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "Question text",
      "options": ["A", "B", "C", "D"],
      "correctAnswer": 0,
      "explanation": "Explanation text"
    },
    // ... 19+ more questions
  ]
}
```

## Data Flow

```
1. User clicks "Start Placement Test"
   ↓
2. TestProvider.startTest('placement')
   ├─ Fetch all level files (a0.json through c2.json)
   ├─ Store in questionsBank: Map<CEFRLevel, Question[]>
   ├─ Select 10 random questions from A0
   ├─ Set currentLevel = 'A0'
   └─ Set currentQuestionIndex = 0
   ↓
3. AdaptivePlacementTest displays question
   ├─ Progress: "A0 Level • Question 1 of 10"
   └─ QuestionCard renders question
   ↓
4. User answers all 10 A0 questions
   ↓
5. User clicks "Finish Level"
   ↓
6. TestProvider validates A0 results
   ├─ Calculate score (correct/total)
   ├─ If score < 70%:
   │  ├─ completeTest() → result = { level: 'A0', passed: false }
   │  └─ Show Results: "Your level is A0"
   │
   └─ If score ≥ 70%:
      ├─ loadNextLevel() → selects 10 random from A1
      ├─ currentLevel = 'A1'
      └─ Go to step 3
   ↓
7. Repeat for A1 → A2 → B1 → B2 → C1 → C2
   ↓
8. If C2 passed:
   ├─ completeTest() → result = { level: 'C2', passed: true }
   └─ Show Results: "C2 — максимальный уровень!"
```

## Components

### New Components

**1. `AdaptivePlacementTest.tsx`**
- Replaces `PlacementTest.tsx` for placement test flow
- Manages sequential level progression
- Displays level-aware progress indicator
- Handles level completion and transition
- Shows "Next Level" button or redirects to Results

### Modified Components

**2. `TestProvider.tsx`**
New state properties:
```typescript
currentLevel: CEFRLevel | null  // Currently testing level
questionsBank: Map<string, Question[]>  // All loaded questions
```

New methods:
```typescript
async loadAllLevelQuestions(): Promise<void>
  // Loads all a0-c2.json files into questionsBank

getRandomQuestions(level: CEFRLevel, count: number): Question[]
  // Returns N random questions from level

loadNextLevel(): Promise<void>
  // Loads next level's random questions

checkLevelPassed(): boolean
  // Checks if current level score ≥ 70%
```

Modified methods:
```typescript
startTest('placement')
  // Now loads all level files instead of single placement-test.json
```

### Unchanged Components
- `HomePage.tsx` — Same "Placement Test" button
- `LevelTest.tsx` — Unchanged for individual level tests
- `Results.tsx` — Unchanged
- `ProgressBar.tsx` — Unchanged
- `NavigationButtons.tsx` — Unchanged
- `QuestionCard.tsx` — Already fixed (resets between questions)

## User Interface

### Progress Display

**During Level:**
```
A2 Level • Question 5 of 10
[████████░░░░░░░░] 50%
```

**Level Complete (Passed):**
```
✓ A2 Complete: 8/10 correct
[Continue to B1 →]
```

**Level Complete (Failed):**
```
A2 Result: 5/10 correct
Your level is A2
[View Results]
```

### Final Results

**If failed at level:**
```
Your Level: A2
```

**If completed C2:**
```
Your Level: C2
C2 — максимальный уровень!
```

## Error Handling

### 1. File Loading Errors
```
Error: Failed to load a1.json
Action: Show error message + "Return to Home" button
Logging: console.error with details
```

### 2. Insufficient Questions
```
If file has < 10 questions:
  - Use all available questions
  - Console warning

If file has < 3 questions:
  - Show error to user
  - Mark level as failed
```

### 3. Browser Close During Test
```
Current behavior (no changes):
  - No progress saved during test
  - Restart from beginning on return
  - Only final results saved to localStorage
```

### 4. Empty Answers
```
Already implemented:
  - NavigationButtons validates hasValidAnswer()
  - "Finish" button disabled until all questions answered
```

## Testing Strategy

### Unit Tests (`__tests__/unit/testCalculation.test.ts`)

```typescript
describe('getRandomQuestions', () => {
  it('should return N random questions from array')
  it('should not return duplicates')
  it('should handle edge case: N > array length')
})

describe('checkLevelPassThreshold', () => {
  it('should return true for 70% (7/10)')
  it('should return false for 60% (6/10)')
  it('should handle empty answers')
})
```

### Integration Tests (`__tests__/integration/adaptive-placement.test.ts`)

```typescript
describe('AdaptivePlacementTest Flow', () => {
  it('should stop at A2 when user fails A2')
  it('should progress A0 → A1 → A2 when passing')
  it('should complete all levels to C2')
  it('should show different questions on each run (randomization)')
})
```

### Manual Testing Checklist

- [ ] All 7 level files exist with 20+ questions each
- [ ] A0 → A1 progression works (pass A0)
- [ ] A0 failure shows result immediately
- [ ] Progress displays "A2 Level • Question 5 of 10"
- [ ] Randomization produces different questions on reload
- [ ] C2 completion shows "C2 — максимальный уровень!"
- [ ] Results page shows correct determined level

### Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| All correct (10/10) | Advance to next level |
| All incorrect (0/10) | Fail current level |
| Exactly 70% (7/10) | Advance to next level |
| 69% (6/10) | Fail current level |
| A0 failure | Show "A0", don't test higher levels |
| C2 pass | Show "C2 — максимальный уровень!" |

## Implementation Notes

### Randomization Algorithm
```typescript
function getRandomQuestions<T>(items: T[], count: number): T[] {
  const shuffled = [...items].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
```

### Level Order
```typescript
const LEVEL_ORDER: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
```

### Threshold Constant
```typescript
const LEVEL_PASS_THRESHOLD = 0.7  // 70%
```

## Migration Plan

### Phase 1: Data Preparation
1. Create 7 new question files (a0-c2.json) with 20+ questions each
2. Archive old placement-test.json and a0-a1.json

### Phase 2: Code Changes
1. Implement `AdaptivePlacementTest.tsx`
2. Update `TestProvider.tsx` with new state and methods
3. Update `testCalculation.ts` with new utility functions

### Phase 3: Testing
1. Write and run unit tests
2. Manual testing of all level progressions
3. Test randomization

### Phase 4: Deployment
1. Update `HomePage.tsx` to use new component
2. Verify production build
3. Deploy

## Success Criteria

- [ ] Student fails A0 → sees "A0" result immediately
- [ ] Student passes all levels → sees "C2 — максимальный!"
- [ ] Each run shows different questions (randomization working)
- [ ] Progress shows "A2 Level • Question 5 of 10" format
- [ ] No errors in console during normal flow
- [ ] Level tests (A0, A1, etc.) still work independently
