'use client'

import { Progress } from '@/components/ui/progress'
import type { Question } from './types'

interface ProgressBarProps {
  questions: Question[]
  currentIndex: number
}

export function ProgressBar({ questions, currentIndex }: ProgressBarProps) {
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-slate-600">
          Progress
        </span>
        <span className="text-sm text-slate-600">
          {currentIndex + 1} of {questions.length}
        </span>
      </div>
      <Progress value={progress} className="h-2" />
    </div>
  )
}
