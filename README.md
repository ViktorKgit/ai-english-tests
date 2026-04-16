# English Level Test Platform

A web application for testing English language proficiency according to the CEFR scale (A0-C2).

## Features

- **Placement Test**: Adaptive sequential test that progresses through levels A0 → A1 → A2 → B1 → B2 → C1 → C2, stopping when you fail a level (70% threshold)
- **Level-Specific Tests**: Fixed tests for each CEFR level (A0, A1, A2, B1, B2, C1, C2)
- **Multiple Question Types**: Multiple choice, fill in the blank, matching, and open-ended questions
- **Instant Results**: Get your determined level or score immediately after completing the test
- **Randomized Questions**: Each level randomly selects 10 questions from a bank of 20+ questions

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

### Building for Production

```bash
npm run build
npm start
```

## Deployment

### Netlify

The project is configured for Netlify deployment:

1. **Automatic deployment**: Connect your Git repository to Netlify
2. **Build settings** (auto-configured via `netlify.toml`):
   - Build command: `npm run build`
   - Publish directory: `.next`
3. **Environment variables**: None required

Alternatively, deploy manually:
```bash
npm run build
netlify deploy --prod
```

### Other Platforms

The project works with any platform that supports Next.js:
- **Vercel** (recommended for Next.js): Connect repo → Deploy
- **Railway**: Works with minimal configuration
- **Render**: Works with Docker or buildpack

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
│   │   ├── AdaptivePlacementTest.tsx  # Adaptive placement test flow
│   │   └── LevelTest.tsx              # Level-specific test flow
│   └── ui/                # shadcn/ui components
├── lib/
│   └── utils/             # Utility functions
│       └── testCalculation.ts         # Test scoring and randomization
├── public/questions/      # Question data (a0-c2.json)
└── __tests__/             # Test files
```

## CEFR Levels

- **A0**: Beginner - No prior knowledge
- **A1**: Elementary - Basic phrases
- **A2**: Pre-Intermediate - Simple communication
- **B1**: Intermediate - Daily situations
- **B2**: Upper-Intermediate - Complex topics
- **C1**: Advanced - Academic/professional
- **C2**: Proficiency - Near-native fluency
