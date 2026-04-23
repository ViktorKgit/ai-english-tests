'use client'

import type { SkillBreakdownItem } from './types'
import { Card, CardContent } from '@/components/ui/card'

interface SkillBreakdownProps {
  breakdown: SkillBreakdownItem[]
}

function getScoreColor(percentage: number): string {
  if (percentage >= 80) return 'bg-green-500'
  if (percentage >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

function getScoreLabel(percentage: number): string {
  if (percentage >= 80) return 'Strong'
  if (percentage >= 60) return 'Fair'
  return 'Needs Practice'
}

export function SkillBreakdown({ breakdown }: SkillBreakdownProps) {
  if (breakdown.length === 0) return null

  // Sort by percentage (lowest first) so weak areas are at the top
  const sorted = [...breakdown].sort((a, b) => a.percentage - b.percentage)

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
      <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-slate-100">
        Performance by Skill
      </h3>
      <div className="space-y-3">
        {sorted.map((item) => (
          <Card key={`${item.skill}-${item.subskill || ''}`} className="border border-slate-200 dark:border-slate-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex-1">
                  <p className="font-medium text-slate-800 dark:text-slate-100">
                    {item.skill.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                    {item.subskill && (
                      <span className="text-slate-500 dark:text-slate-400 ml-2">
                        ({item.subskill.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')})
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {item.correct} out of {item.total} correct
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {item.percentage}%
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {getScoreLabel(item.percentage)}
                  </p>
                </div>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getScoreColor(item.percentage)}`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
