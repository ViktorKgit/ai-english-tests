'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import type { TestState, TestType, CEFRLevel, Question, Answer, TestResult } from './types'
import { calculateLevelTestScore, determinePlacementLevel, generateRecommendations, getRandomQuestions as getRandomQuestionsFromUtil, checkLevelPassThreshold } from '@/lib/utils/testCalculation'

interface TestContextType extends TestState {
  startTest: (testType: TestType, level?: CEFRLevel) => Promise<void>
  answerQuestion: (questionId: string, answer: Answer) => void
  goToQuestion: (index: number) => void
  nextQuestion: () => void
  previousQuestion: () => void
  completeTest: () => void
  restart: () => void
  loadNextLevel: () => void
  checkLevelPassed: () => boolean
  getRandomQuestions: (level: CEFRLevel, count: number) => Question[]
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
    currentLevel: null,
    questionsBank: null,
  })

  const loadAllLevelQuestions = useCallback(async (): Promise<Map<string, Question[]>> => {
    const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const bank = new Map<string, Question[]>()

    try {
      for (const level of levels) {
        const response = await fetch(`/questions/${level.toLowerCase()}.json`)
        if (!response.ok) {
          throw new Error(`Failed to load questions for level ${level}: ${response.statusText}`)
        }
        const data = await response.json()
        bank.set(level, data.questions)
      }
    } catch (error) {
      console.error('Error loading level questions:', error)
      throw error
    }

    return bank
  }, [])

  const getRandomQuestions = useCallback((level: CEFRLevel, count: number): Question[] => {
    if (!state.questionsBank) return []
    const questions = state.questionsBank.get(level) || []
    return getRandomQuestionsFromUtil(questions, count)
  }, [state.questionsBank])

  const loadNextLevel = useCallback(async () => {
    if (!state.currentLevel) return

    const levels: CEFRLevel[] = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    const currentIndex = levels.indexOf(state.currentLevel)

    if (currentIndex < levels.length - 1) {
      const nextLevel = levels[currentIndex + 1]
      const nextQuestions = getRandomQuestions(nextLevel, 10)

      setState(prev => ({
        ...prev,
        level: nextLevel,
        currentLevel: nextLevel,
        questions: nextQuestions,
        currentQuestionIndex: 0,
        answers: new Map(),
      }))
    }
  }, [state.currentLevel, getRandomQuestions])

  const checkLevelPassed = useCallback((): boolean => {
    return checkLevelPassThreshold(state.questions, state.answers)
  }, [state.questions, state.answers])

  const startTest = useCallback(async (testType: TestType, level?: CEFRLevel) => {
    let questions: Question[] = []

    if (testType === 'placement') {
      // Load all level questions into bank
      const bank = await loadAllLevelQuestions()

      // Start with A0 level, select 10 random questions
      const initialLevel: CEFRLevel = 'A0'
      const initialQuestions = getRandomQuestionsFromUtil(bank.get(initialLevel) || [], 10)

      setState({
        testType,
        questions: initialQuestions,
        currentQuestionIndex: 0,
        answers: new Map(),
        isComplete: false,
        currentLevel: initialLevel,
        questionsBank: bank,
      })
      return
    } else if (level) {
      const response = await fetch(`/questions/${level.toLowerCase()}.json`)
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
      currentLevel: null,
      questionsBank: null,
    })
  }, [loadAllLevelQuestions, getRandomQuestions])

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
      currentLevel: null,
      questionsBank: null,
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
        loadNextLevel,
        checkLevelPassed,
        getRandomQuestions,
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
