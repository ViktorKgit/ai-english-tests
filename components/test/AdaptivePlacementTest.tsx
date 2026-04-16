'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
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
    checkLevelPassed
  } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const isLevelComplete = currentQuestionIndex === questions.length - 1
  const allQuestionsAnswered = isLevelComplete && questions.every(q => answers.has(q.id))

  // Check if level passed when all questions answered
  const levelPassed = allQuestionsAnswered ? checkLevelPassed() : false
  const isLastLevel = currentLevel === 'C2'
  const hasNextLevel = LEVEL_ORDER.indexOf(currentLevel!) < LEVEL_ORDER.length - 1

  const handleNextLevel = () => {
    loadNextLevel()
  }

  const handleCompleteTest = () => {
    completeTest()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Level-aware header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">
            {currentLevel} Level • Question {currentQuestionIndex + 1} of {questions.length}
          </h1>
          <p className="text-slate-600">
            Answer each question to determine your level.
          </p>
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
        {isLevelComplete && allQuestionsAnswered ? (
          <div className="mt-6">
            <Card className="border-2 border-slate-200">
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  {levelPassed && hasNextLevel ? (
                    <>
                      <p className="text-lg font-medium text-green-600">
                        ✓ {currentLevel} Complete! Moving to next level...
                      </p>
                      <Button onClick={handleNextLevel} size="lg">
                        Continue to {LEVEL_ORDER[LEVEL_ORDER.indexOf(currentLevel!) + 1]} →
                      </Button>
                    </>
                  ) : levelPassed && isLastLevel ? (
                    <>
                      <p className="text-lg font-medium text-green-600">
                        ✓ C2 Complete — Maximum level!
                      </p>
                      <Button onClick={handleCompleteTest} size="lg">
                        View Results
                      </Button>
                    </>
                  ) : (
                    <>
                      <p className="text-lg font-medium text-slate-700">
                        Your level is {currentLevel}
                      </p>
                      <Button onClick={handleCompleteTest} size="lg">
                        View Results
                      </Button>
                    </>
                  )}
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
