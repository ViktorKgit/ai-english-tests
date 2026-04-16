'use client'

import { useTest } from './TestProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { CEFRLevel } from './types'

const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']

const levelDescriptions: Record<CEFRLevel, string> = {
  'A0': 'Beginner - No prior knowledge',
  'A1': 'Elementary - Basic phrases',
  'A2': 'Pre-Intermediate - Simple communication',
  'B1': 'Intermediate - Daily situations',
  'B2': 'Upper-Intermediate - Complex topics',
  'C1': 'Advanced - Academic/professional',
  'C2': 'Proficiency - Near-native fluency',
}

export function HomePage() {
  const { startTest } = useTest()

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            English Level Test
          </h1>
          <p className="text-lg text-slate-600">
            Determine your English proficiency level according to the CEFR scale
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Placement Test</CardTitle>
              <CardDescription>
                Not sure of your level? Let us determine it for you.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => startTest('placement')}
                className="w-full"
                size="lg"
              >
                Start Placement Test
              </Button>
              <p className="text-sm text-slate-500 mt-4">
                ~20-30 questions • Adaptive difficulty
              </p>
            </CardContent>
          </Card>

          <Card className="border-2 border-slate-200 hover:border-slate-400 transition-colors">
            <CardHeader>
              <CardTitle className="text-2xl">Level Test</CardTitle>
              <CardDescription>
                Test a specific CEFR level
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {levels.map(level => (
                <Button
                  key={level}
                  onClick={() => startTest('level', level)}
                  variant="outline"
                  className="w-full justify-between"
                >
                  <span>Level {level}</span>
                  <span className="text-sm text-slate-500">{levelDescriptions[level]}</span>
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
