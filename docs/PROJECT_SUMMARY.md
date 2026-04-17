# Adaptive Placement Test - Project Summary

**Date:** 2026-04-17
**Status:** Completed - Version 1.1

## Overview

Web application for testing English language proficiency according to the CEFR scale (A0-C2) with adaptive sequential placement test.

## Key Features

1. **Adaptive Placement Test**
   - Sequential progression through levels: A0 → A1 → A2 → B1 → B2 → C1 → C2
   - Stops when student fails a level (70% threshold = 7 of 10 questions)
   - Each level uses 10 randomly selected questions from a bank of 45 questions
   - Progress display: "{Level} Level • Question X of 10"
   - Shows elapsed time during test
   - Success message includes correct answer count (e.g., "A0 level passed! 7/10 correct")

2. **Level-Specific Tests**
   - Individual tests for each CEFR level (A0, A1, A2, B1, B2, C1, C2)
   - Fixed set of 10 randomly selected questions per test

3. **Question Types**
   - Multiple choice (4 options, shuffled each time)
   - Fill in the blank (supports multiple correct answers)
   - Matching pairs
   - Open-ended

4. **User Experience Features**
   - Press Enter to advance to next question
   - Empty answers allowed for specific questions (e.g., "I like ___ pizza")
   - Elapsed timer shows total time spent
   - Randomized answer options prevent memorization

## Architecture

### Tech Stack
- Next.js 15.2.4 with Turbopack
- React 19
- TypeScript
- Tailwind CSS v3 (downgraded from v4 for compatibility)
- shadcn/ui components
- Vitest for testing

### File Structure

```
ai-english/
├── app/
│   ├── layout.tsx          # Root layout with TestProvider
│   ├── page.tsx            # Main routing (HomePage → Test → Results)
│   └── globals.css         # Tailwind CSS imports
│
├── components/
│   ├── test/
│   │   ├── TestProvider.tsx            # Context provider with state management
│   │   ├── AdaptivePlacementTest.tsx   # Adaptive placement test component
│   │   ├── LevelTest.tsx               # Level-specific test component
│   │   ├── HomePage.tsx                # Landing page
│   │   ├── QuestionCard.tsx            # Question display component
│   │   ├── ProgressBar.tsx             # Progress indicator
│   │   ├── NavigationButtons.tsx       # Next/Previous/Finish buttons
│   │   ├── Results.tsx                 # Results page
│   │   ├── Timer.tsx                   # Timer component (elapsed/remaining modes)
│   │   └── types.ts                    # TypeScript definitions
│   └── ui/                             # shadcn/ui components
│
├── lib/utils/
│   └── testCalculation.ts              # Scoring and randomization utilities
│
└── public/questions/
    ├── a0.json                          # 20 A0 level questions
    ├── a1.json                          # 20 A1 level questions
    ├── a2.json                          # 20 A2 level questions
    ├── b1.json                          # 20 B1 level questions
    ├── b2.json                          # 20 B2 level questions
    ├── c1.json                          # 20 C1 level questions
    ├── c2.json                          # 20 C2 level questions
    └── archived/                        # Old placement-test.json and a0-a1.json
```

## Core Components

### TestProvider.tsx
Manages global test state using React Context:

**State:**
- `testType`: 'placement' | 'level'
- `level`: CEFRLevel (for level tests)
- `questions`: Question[] (current test questions)
- `currentQuestionIndex`: number
- `answers`: Map<string, Answer>
- `isComplete`: boolean
- `currentLevel`: CEFRLevel | null (for adaptive test)
- `questionsBank`: Map<string, Question[]> | null (all loaded questions)
- `timeElapsed`: number (seconds since test started)
- `testStartTime`: number (timestamp for elapsed time calculation)

**Key Methods:**
- `startTest(testType, level?)`: Initiates a test
- `loadAllLevelQuestions()`: Loads all level files for adaptive test
- `loadNextLevel()`: Advances to next CEFR level in adaptive test
- `checkLevelPassed()`: Returns true if score ≥ 70%
- `completeTest()`: Calculates results and saves to localStorage
- `answerQuestion(questionId, answer)`: Records an answer

### AdaptivePlacementTest.tsx
Handles the sequential adaptive test flow:

**Logic:**
1. Displays current level and question progress
2. When all 10 questions answered:
   - If score ≥ 70% AND not C2: Show "Continue to {NextLevel}" button
   - If score ≥ 70% AND is C2: Show "C2 Complete!" message
   - If score < 70%: Show "Your level is {Level}" message
3. User clicks button to continue or view results

### testCalculation.ts
Utility functions:

- `getRandomQuestions<T>(items, count)`: Fisher-Yates shuffle algorithm
- `calculateCorrectCount(questions, answers)`: Counts correct answers
- `checkLevelPassThreshold(questions, answers)`: Returns true if score ≥ 70%
- `calculateLevelTestScore(questions, answers)`: Returns score and pass/fail
- `checkAnswer(question, answer)`: Unified answer validation for all question types
- `determinePlacementLevel(results)`: Determines CEFR level from test results
- `generateRecommendations(level)`: Returns learning recommendations

## Question File Format

```json
{
  "name": "A0 English Test",
  "level": "A0",
  "questions": [
    {
      "id": "a0-1",
      "difficulty": 1,
      "type": "multiple-choice",
      "prompt": "I ___ a student.",
      "options": ["am", "is", "are", "be"],
      "correctAnswer": 0,
      "explanation": "Use 'am' with 'I'."
    },
    {
      "id": "a0-30",
      "difficulty": 1,
      "type": "fill-blank",
      "prompt": "I like ___ pizza.",
      "correctAnswer": ["", "some", "the"],
      "explanation": "No article needed with general plural/uncountable nouns."
    }
  ]
}
```

**Difficulty levels:** 1=A0, 2=A1, 3=A2, 4=B1, 5=B2, 6=C1

**Note:** `correctAnswer` for fill-blank can be a string or an array of strings (multiple acceptable answers). An empty string `""` allows leaving the field blank.

## Development

### Running the application
```bash
npm run dev
```

### Running tests
```bash
npm run test
```

### Building for production
```bash
npm run build
npm start
```

## Known Issues

1. **Turbopack on Windows**: Sometimes has CSS processing issues. Solution: Delete `.next` folder and restart.
2. **Port conflicts**: If port 3000 is in use, Next.js automatically uses 3001.

## Future Improvements

1. Add more questions per level (currently 45)
2. Add more question types (audio, video, drag-and-drop)
3. Save progress during test (currently only saves final result)
4. Add detailed feedback per question after test completion
5. Add review mode to see answers after test
6. Backend integration for result tracking
7. Multi-language support for interface

## Version History

### v1.1 (2026-04-17)
- Added elapsed timer showing time spent on test
- Answer options now shuffle randomly each time
- Added correct answer count to success messages (e.g., "7/10 correct")
- Press Enter to advance to next question
- Empty answers now allowed for specific questions
- Removed duplicate answer validation logic
- fill-blank questions support multiple correct answers
- Improved placement test result calculation (returns lowest tested level on failure)

### v1.0 (2026-04-16)
- Initial release with adaptive placement test
- 7 CEFR levels (A0-C2)
- 20 questions per level
- Sequential adaptive progression
- 70% pass threshold
- Randomized questions

## Credits

Developed with Claude Code using Subagent-Driven Development methodology.
