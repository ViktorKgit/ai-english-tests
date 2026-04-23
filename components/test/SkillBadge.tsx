'use client'

import type { Question } from './types'

interface SkillBadgeProps {
  question: Question
}

// Format skill name for display (convert kebab-case to Title Case)
function formatSkill(skill?: string): string {
  if (!skill) return ''
  return skill
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Get category and display name for a skill
function getSkillInfo(skill?: string) {
  if (!skill) return null

  const grammarSkills = [
    'articles', 'to-be', 'have-got', 'present-simple', 'present-continuous',
    'present-perfect', 'present-perfect-continuous', 'past-simple', 'past-perfect-continuous',
    'future-will', 'future-perfect', 'future-in-the-past', 'be-going-to', 'used-to',
    'conditionals', 'complex-conditionals', 'conditional-inversion', 'passive-voice',
    'passive-infinitive', 'passive-reporting', 'modal-verbs', 'modal-perfect',
    'reported-speech', 'question-formation', 'wh-questions', 'question-tags',
    'relative-clauses', 'time-clauses', 'result-clauses', 'concessive-structures',
    'inversion', 'cleft-sentences', 'ellipsis', 'participle-clauses', 'gerunds',
    'infinitives', 'need-ing', 'subjunctive', 'wish', 'wish-regrets',
  ]

  const vocabularySkills = [
    'vocabulary', 'advanced-vocabulary', 'formal-vocabulary', 'confusable-words',
    'phrasal-verbs', 'idioms', 'sophisticated-idioms', 'fixed-expressions',
    'formal-idioms', 'formal-verbs', 'formal-adjectives', 'formal-prepositions',
  ]

  const category = grammarSkills.includes(skill)
    ? 'Grammar'
    : vocabularySkills.includes(skill)
      ? 'Vocabulary'
      : 'Skill'

  return { category, name: formatSkill(skill) }
}

export function SkillBadge({ question }: SkillBadgeProps) {
  const skillInfo = getSkillInfo(question.skill)

  if (!skillInfo) return null

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
        {skillInfo.category}: {skillInfo.name}
      </span>
      {question.subskill && (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300">
          {formatSkill(question.subskill)}
        </span>
      )}
    </div>
  )
}
