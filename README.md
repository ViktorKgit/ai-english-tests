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
│   └── utils/             # Utility functions
├── public/questions/      # Question data
└── __tests__/             # Test files
```

## CEFR Levels

- **A0-A1**: Beginner/Elementary
- **A2**: Pre-Intermediate
- **B1**: Intermediate
- **B2**: Upper-Intermediate
- **C1**: Advanced
- **C2**: Proficiency
