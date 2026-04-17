'use client'

import { useState, useEffect } from 'react'
import type { Question, Answer } from './types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface QuestionCardProps {
  question: Question
  answer?: Answer
  onAnswerChange: (answer: Answer) => void
  showFeedback?: boolean
  onNext?: () => void
}

export function QuestionCard({ question, answer, onAnswerChange, showFeedback, onNext }: QuestionCardProps) {
  // For fill-blank, use empty string as initial value instead of null
  const getInitialValue = () => {
    if (question.type === 'fill-blank') {
      return answer?.value ?? ''
    }
    return answer?.value ?? null
  }

  const [localValue, setLocalValue] = useState<Answer['value']>(getInitialValue())

  // Reset local value when question changes
  useEffect(() => {
    setLocalValue(getInitialValue())
  }, [question.id, answer])

  const handleChange = (newValue: Answer['value']) => {
    setLocalValue(newValue)
    onAnswerChange({ type: question.type, value: newValue } as Answer)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onNext) {
      e.preventDefault()
      onNext()
    }
  }

  const renderQuestion = () => {
    switch (question.type) {
      case 'multiple-choice':
        return (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <Button
                key={index}
                onClick={() => handleChange(index)}
                variant={localValue === index ? 'default' : 'outline'}
                className="w-full justify-start text-left h-auto py-4 px-6"
              >
                <span className="font-medium mr-3">{String.fromCharCode(65 + index)}.</span>
                {option}
              </Button>
            ))}
          </div>
        )

      case 'fill-blank':
        const parts = question.prompt.split('__blank__')
        return (
          <div className="space-y-4">
            <p className="text-lg">
              {parts[0]}
              <input
                type="text"
                value={localValue as string || ''}
                onChange={(e) => handleChange(e.target.value)}
                className="mx-2 px-3 py-1 border-b-2 border-slate-300 focus:border-slate-600 outline-none bg-transparent w-32"
                placeholder="..."
                autoFocus
              />
              {parts[1]}
            </p>
          </div>
        )

      case 'matching':
        const currentMatches = localValue as Record<string, string> || {}
        return (
          <div className="space-y-4">
            {question.pairs.map((pair, index) => (
              <div key={index} className="flex items-center gap-4">
                <span className="font-medium min-w-[120px]">{pair.left}</span>
                <span>→</span>
                <select
                  value={currentMatches[pair.left] || ''}
                  onChange={(e) => {
                    const newMatches = { ...currentMatches, [pair.left]: e.target.value }
                    handleChange(newMatches)
                  }}
                  className="flex-1 px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select match...</option>
                  {question.pairs.map((p, i) => (
                    <option key={i} value={p.right}>{p.right}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )

      case 'open-ended':
        return (
          <div className="space-y-4">
            <textarea
              value={localValue as string || ''}
              onChange={(e) => handleChange(e.target.value)}
              placeholder="Type your answer here..."
              className="w-full min-h-[120px] px-4 py-3 border border-slate-300 rounded-md resize-y"
            />
            <p className="text-sm text-slate-500">
              Provide a detailed answer (at least 3 words)
            </p>
          </div>
        )
    }
  }

  return (
    <Card
      className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="dark:text-slate-100">Question</span>
          <span className="text-sm font-normal text-slate-500 dark:text-slate-400">
            {question.type === 'multiple-choice' && 'Select one answer'}
            {question.type === 'fill-blank' && 'Fill in the blank'}
            {question.type === 'matching' && 'Match the pairs'}
            {question.type === 'open-ended' && 'Open-ended response'}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <p className="text-lg font-medium text-slate-800 dark:text-slate-100">
            {(question.type === 'multiple-choice' || question.type === 'open-ended') && question.prompt}
          </p>
        </div>
        {renderQuestion()}
      </CardContent>
    </Card>
  )
}
