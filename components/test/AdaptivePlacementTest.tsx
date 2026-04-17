'use client'

import { useState } from 'react'
import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Timer } from './Timer'
import { checkAnswer } from '@/lib/utils/testCalculation'
import type { CEFRLevel } from './types'

const LEVEL_ORDER: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function AdaptivePlacementTest() {
  const [levelSuccessMessage, setLevelSuccessMessage] = useState<string | null>(null)

  const {
    questions,
    currentQuestionIndex,
    answers,
    answerQuestion,
    previousQuestion,
    nextQuestion,
    completeTest,
    currentLevel,
    loadNextLevel,
    checkLevelPassed,
    restart,
    timeRemaining,
    timeElapsed,
  } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLastQuestion = currentQuestionIndex === questions.length - 1

  const handleNext = () => {
    if (isLastQuestion) {
      // Last question - check level result
      const passed = checkLevelPassed()

      if (passed) {
        // Calculate correct answers count
        let correctCount = 0
        for (const question of questions) {
          const answer = answers.get(question.id)
          if (answer && checkAnswer(question, answer)) {
            correctCount++
          }
        }

        // Store the level that was passed before loading next
        const passedLevel = currentLevel

        // Load next level immediately
        loadNextLevel()

        // Show success message after level loads
        setTimeout(() => {
          setLevelSuccessMessage(`🎉 ${passedLevel} level passed! ${correctCount}/${questions.length} correct`)

          // Fade out message after 3 seconds
          setTimeout(() => {
            setLevelSuccessMessage(null)
          }, 3000)
        }, 500)
      } else {
        // Failed - complete test and show results
        completeTest()
      }
    } else {
      // Not last question - normal next
      nextQuestion()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header with theme toggle, timer, and exit button */}
        <div className="mb-8 flex items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">
              {currentLevel} Level • Question {currentQuestionIndex + 1} of {questions.length}
            </h1>
            <p className="text-slate-600 dark:text-slate-400">
              Answer each question to determine your level.
            </p>
          </div>
          <div className="flex items-center gap-3">
            {timeElapsed !== undefined && (
              <Timer
                timeElapsed={timeElapsed}
                mode="elapsed"
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
            onNext={handleNext}
          />
        </div>

        {/* Level success message with fade animation */}
        {levelSuccessMessage && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
            <div className="bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg animate-fade-out">
              <p className="font-medium">{levelSuccessMessage}</p>
            </div>
          </div>
        )}

        {/* Navigation buttons */}
        <div className="mt-6">
          <NavigationButtons
            questions={questions}
            currentIndex={currentQuestionIndex}
            answers={answers}
            onPrevious={previousQuestion}
            onNext={handleNext}
            onComplete={completeTest}
            useNextForLast={true}
          />
        </div>
      </div>
    </div>
  )
}
