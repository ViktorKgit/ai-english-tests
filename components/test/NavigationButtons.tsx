'use client'

import { Button } from '@/components/ui/button'
import { ArrowLeft, ArrowRight, Check } from 'lucide-react'
import { validateAnswer } from '@/lib/utils/validation'
import type { Question, Answer } from './types'

interface NavigationButtonsProps {
  questions: Question[]
  currentIndex: number
  answers: Map<string, Answer>
  onPrevious: () => void
  onNext: () => void
  onComplete: () => void
}

export function NavigationButtons({
  questions,
  currentIndex,
  answers,
  onPrevious,
  onNext,
  onComplete,
}: NavigationButtonsProps) {
  const currentQuestion = questions[currentIndex]
  const currentAnswer = answers.get(currentQuestion.id)

  // Create a typed fallback for unanswered questions
  const fallbackAnswer: Answer = {
    type: currentQuestion.type,
    value: null,
  } as Answer

  const validation = validateAnswer(currentQuestion, currentAnswer ?? fallbackAnswer)
  const canProceed = validation.valid

  const isLastQuestion = currentIndex === questions.length - 1

  return (
    <div className="flex justify-between items-center">
      <Button
        onClick={onPrevious}
        disabled={currentIndex === 0}
        variant="outline"
        size="lg"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Previous
      </Button>

      {!validation.valid && currentAnswer && (
        <span className="text-sm text-red-500">{validation.error}</span>
      )}

      {isLastQuestion ? (
        <Button
          onClick={onComplete}
          disabled={!canProceed}
          size="lg"
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Test
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canProceed}
          size="lg"
        >
          Next
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      )}
    </div>
  )
}
