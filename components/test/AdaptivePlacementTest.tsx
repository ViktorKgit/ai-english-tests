'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Check } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { Timer } from './Timer'
import type { CEFRLevel } from './types'

const LEVEL_ORDER: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

export function AdaptivePlacementTest() {
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
    startTimer
  } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLevelComplete = currentQuestionIndex === questions.length - 1 && answers.has(currentQuestion.id)

  const isLastLevel = currentLevel === 'C2'
  const hasNextLevel = LEVEL_ORDER.indexOf(currentLevel!) < LEVEL_ORDER.length - 1

  const handleFinishLevel = () => {
    const passed = checkLevelPassed()
    return passed
  }

  const handleNextLevel = () => {
    loadNextLevel()
  }

  const handleCompleteTest = () => {
    completeTest()
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

        {/* Level complete or continue navigation */}
        {isLevelComplete ? (
          <div className="mt-6">
            <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-lg font-medium text-slate-700 dark:text-slate-300">
                    Level complete! Ready to see your results?
                  </p>
                  <Button onClick={() => {
                    const passed = handleFinishLevel()
                    if (passed && hasNextLevel) {
                      handleNextLevel()
                    } else if (passed && isLastLevel) {
                      handleCompleteTest()
                    } else {
                      handleCompleteTest()
                    }
                  }} size="lg" className="bg-green-600 hover:bg-green-700">
                    <Check className="mr-2 h-4 w-4" />
                    Finish Level
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
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
        )}
      </div>
    </div>
  )
}
