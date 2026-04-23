'use client'

import { useTest } from './TestProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Award } from 'lucide-react'
import { ThemeToggle } from '@/components/ThemeToggle'
import { checkAnswer } from '@/lib/utils/testCalculation'
import type { CEFRLevel } from './types'

const CEFR_LEVELS: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

function CEFRScale({ currentLevel }: { currentLevel: CEFRLevel }) {
  const currentIndex = CEFR_LEVELS.indexOf(currentLevel)

  return (
    <div className="flex items-center gap-1 flex-wrap justify-center mt-4">
      {CEFR_LEVELS.map((level) => {
        const levelIndex = CEFR_LEVELS.indexOf(level)
        const isCompleted = levelIndex <= currentIndex
        const isCurrent = level === currentLevel

        return (
          <div key={level} className="flex items-center">
            <div
              className={`h-2 w-8 rounded-full transition-all ${
                isCurrent
                  ? 'bg-green-500 scale-110'
                  : isCompleted
                  ? 'bg-green-300 dark:bg-green-700'
                  : 'bg-gray-200 dark:bg-gray-700'
              }`}
              title={level}
            />
            {levelIndex < CEFR_LEVELS.length - 1 && (
              <div className={`w-2 h-0.5 ${isCompleted ? 'bg-green-300 dark:bg-green-700' : 'bg-gray-200 dark:bg-gray-700'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

export function Results() {
  const { result, restart, questions, answers } = useTest()

  if (!result) return null

  const isPlacement = result.testType === 'placement'
  const passed = result.passed ?? false

  // Calculate score details
  let correct = 0
  const total = questions.length

  for (const question of questions) {
    const answer = answers.get(question.id)
    if (!answer) continue

    if (checkAnswer(question, answer)) correct++
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Theme toggle in top right */}
        <div className="flex justify-end mb-4">
          <ThemeToggle />
        </div>

        <Card className="border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed || isPlacement ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl dark:text-slate-100">
              {isPlacement ? 'Your Level' : passed ? 'Passed!' : 'Not Passed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPlacement ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {result.level}
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  Based on your performance, your English level is {result.level}
                </p>
                {result.level && <CEFRScale currentLevel={result.level} />}

                {/* Show failed level info if applicable */}
                {result.failedLevel && (
                  <div className="mt-6 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      {result.failedLevel} Level: {result.failedLevelCorrect} out of {result.failedLevelTotal} correct
                    </p>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">
                      You needed {Math.round(result.failedLevelTotal! * 0.7)} correct answers to pass this level.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 dark:text-slate-100 mb-2">
                  {result.score}%
                </div>
                <p className="text-slate-600 dark:text-slate-400">
                  {correct} out of {total} correct answers
                </p>
                {result.level && <CEFRScale currentLevel={result.level} />}
              </div>
            )}

            <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center text-slate-800 dark:text-slate-100">
                <Award className="mr-2 h-5 w-5" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-slate-400 dark:text-slate-500 mr-2">•</span>
                    <span className="text-slate-600 dark:text-slate-400">{rec}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={restart} variant="outline" className="flex-1">
                Take Another Test
              </Button>
              <Button onClick={restart} className="flex-1">
                Retry Same Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
