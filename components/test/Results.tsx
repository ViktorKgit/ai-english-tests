'use client'

import { useTest } from './TestProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Award } from 'lucide-react'

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

    const isCorrect = checkIsCorrect(question, answer)
    if (isCorrect) correct++
  }

  function checkIsCorrect(question: any, answer: any): boolean {
    switch (question.type) {
      case 'multiple-choice':
        return answer.value === question.correctAnswer
      case 'fill-blank':
        return answer.value.toLowerCase() === question.correctAnswer.toLowerCase()
      default:
        return false
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Card className="border-2">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4">
              {passed || isPlacement ? (
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              ) : (
                <XCircle className="h-16 w-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-3xl">
              {isPlacement ? 'Your Level' : passed ? 'Passed!' : 'Not Passed'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {isPlacement ? (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 mb-2">
                  {result.level}
                </div>
                <p className="text-slate-600">
                  Based on your performance, your English level is {result.level}
                </p>
              </div>
            ) : (
              <div className="text-center">
                <div className="text-6xl font-bold text-slate-800 mb-2">
                  {result.score}%
                </div>
                <p className="text-slate-600">
                  {correct} out of {total} correct answers
                </p>
              </div>
            )}

            <div className="border-t pt-6">
              <h3 className="font-semibold text-lg mb-3 flex items-center">
                <Award className="mr-2 h-5 w-5" />
                Recommendations
              </h3>
              <ul className="space-y-2">
                {result.recommendations.map((rec, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-slate-400 mr-2">•</span>
                    <span className="text-slate-600">{rec}</span>
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
