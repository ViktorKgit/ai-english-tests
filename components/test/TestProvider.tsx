'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { TestState, TestType, CEFRLevel, Question, Answer, TestResult } from './types'
import { calculateLevelTestScore, determinePlacementLevel, generateRecommendations } from '@/lib/utils/testCalculation'

interface TestContextType extends TestState {
  startTest: (testType: TestType, level?: CEFRLevel) => Promise<void>
  answerQuestion: (questionId: string, answer: Answer) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeTest: () => void
  restart: () => void
}

const TestContext = createContext<TestContextType | null>(null)

export function useTest() {
  const context = useContext(TestContext)
  if (!context) throw new Error('useTest must be used within TestProvider')
  return context
}

interface TestProviderProps {
  children: React.ReactNode
}

export function TestProvider({ children }: TestProviderProps) {
  const [state, setState] = useState<TestState>({
    testType: null,
    questions: [],
    currentQuestionIndex: 0,
    answers: new Map(),
    isComplete: false,
  })

  const startTest = useCallback(async (testType: TestType, level?: CEFRLevel) => {
    let questions: Question[] = []

    if (testType === 'placement') {
      const response = await fetch('/lib/questions/placement-test.json')
      const data = await response.json()
      questions = data.questions
    } else if (level) {
      const levelMap: Record<CEFRLevel, string> = {
        'A0': 'a0-a1',
        'A1': 'a0-a1',
        'A2': 'a2',
        'B1': 'b1',
        'B2': 'b2',
        'C1': 'c1',
        'C2': 'c2',
      }
      const response = await fetch(`/lib/questions/${levelMap[level]}.json`)
      const data = await response.json()
      questions = data.questions
    }

    setState({
      testType,
      level,
      questions,
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
    })
  }, [])

  const answerQuestion = useCallback((questionId: string, answer: Answer) => {
    setState(prev => {
      const newAnswers = new Map(prev.answers)
      newAnswers.set(questionId, answer)
      return { ...prev, answers: newAnswers }
    })
  }, [])

  const goToQuestion = useCallback((index: number) => {
    setState(prev => ({ ...prev, currentQuestionIndex: index }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1)
    }))
  }, [])

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0)
    }))
  }, [])

  const completeTest = useCallback(() => {
    setState(prev => {
      let result: TestResult

      if (prev.testType === 'placement') {
        // Calculate placement result
        const results = prev.questions.map((q, i) => ({
          questionId: q.id,
          correct: isAnswerCorrect(q, prev.answers.get(q.id)),
          difficulty: q.difficulty,
        }))
        const level = determinePlacementLevel(results)
        result = {
          testType: 'placement',
          level,
          recommendations: generateRecommendations(level),
          completedAt: new Date(),
        }
      } else {
        // Calculate level test result
        const scoreResult = calculateLevelTestScore(prev.questions, prev.answers)
        result = {
          testType: 'level',
          level: prev.level,
          score: scoreResult.score,
          passed: scoreResult.passed,
          recommendations: generateRecommendations(scoreResult),
          completedAt: new Date(),
        }
      }

      // Save to localStorage
      try {
        const history = JSON.parse(localStorage.getItem('testHistory') || '[]')
        history.push(result)
        localStorage.setItem('testHistory', JSON.stringify(history))
      } catch (e) {
        console.error('Failed to save to localStorage', e)
      }

      return { ...prev, isComplete: true, result }
    })
  }, [])

  const restart = useCallback(() => {
    setState({
      testType: null,
      questions: [],
      currentQuestionIndex: 0,
      answers: new Map(),
      isComplete: false,
      result: undefined,
    })
  }, [])

  return (
    <TestContext.Provider
      value={{
        ...state,
        startTest,
        answerQuestion,
        goToQuestion,
        nextQuestion,
        previousQuestion,
        completeTest,
        restart,
      }}
    >
      {children}
    </TestContext.Provider>
  )
}

function isAnswerCorrect(question: Question, answer?: Answer): boolean {
  if (!answer) return false

  switch (question.type) {
    case 'multiple-choice':
      return answer.type === 'multiple-choice' && answer.value === question.correctAnswer
    case 'fill-blank':
      return answer.type === 'fill-blank' && answer.value.toLowerCase() === question.correctAnswer.toLowerCase()
    case 'matching':
      return answer.type === 'matching' &&
        question.pairs.every(p => answer.value[p.left] === p.right)
    case 'open-ended':
      return answer.type === 'open-ended' &&
        question.correctAnswer.some(a => answer.value.toLowerCase().includes(a.toLowerCase()))
  }
}
