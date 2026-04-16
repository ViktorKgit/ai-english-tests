'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { Button } from '@/components/ui/button'
import { Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Timer } from './Timer'

export function LevelTest() {
  const { questions, currentQuestionIndex, answers, answerQuestion, previousQuestion, nextQuestion, completeTest, level, restart, timeRemaining } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Level {level} Test</h1>
            <p className="text-slate-600 dark:text-slate-400">Answer each question. You need 70% to pass.</p>
          </div>
          <div className="flex items-center gap-3">
            {timeRemaining !== undefined && timeRemaining > 0 && (
              <Timer
                timeRemaining={timeRemaining}
                onTimeUp={() => {/* Time's up */}}
              />
            )}
            <ThemeToggle />
            <Button
              onClick={restart}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Home className="h-4 w-4" />
              Exit
            </Button>
          </div>
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
