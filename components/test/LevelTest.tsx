'use client'

import { useTest } from './TestProvider'
import { QuestionCard } from './QuestionCard'
import { ProgressBar } from './ProgressBar'
import { NavigationButtons } from './NavigationButtons'

export function LevelTest() {
  const { questions, currentQuestionIndex, answers, answerQuestion, previousQuestion, nextQuestion, completeTest, level } = useTest()

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-600">Loading...</p>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-800 mb-2">Level {level} Test</h1>
          <p className="text-slate-600">Answer each question. You need 70% to pass.</p>
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
