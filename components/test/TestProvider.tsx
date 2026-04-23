'use client'

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import type { TestState, TestType, CEFRLevel, Question, Answer, TestResult, SkillBreakdownItem } from './types'
import { calculateLevelTestScore, determinePlacementLevel, generateRecommendations, getRandomQuestions as getRandomQuestionsFromUtil, checkLevelPassThreshold, checkAnswer } from '@/lib/utils/testCalculation'

const TIME_PER_QUESTION = 120 // 2 minutes per question in seconds

/**
 * Calculate skill breakdown from questions and answers
 */
function calculateSkillBreakdown(questions: Question[], answers: Map<string, Answer>): SkillBreakdownItem[] {
  const skillMap = new Map<string, { correct: number; total: number; subskill?: string }>()

  for (const question of questions) {
    const skill = question.skill || 'general'
    const answer = answers.get(question.id)
    const isCorrect = answer ? checkAnswer(question, answer) : false

    const current = skillMap.get(skill) || { correct: 0, total: 0, subskill: question.subskill }
    current.total++
    if (isCorrect) current.correct++

    // Store subskill from first question with this skill
    if (!current.subskill && question.subskill) {
      current.subskill = question.subskill
    }

    skillMap.set(skill, current)
  }

  return Array.from(skillMap.entries()).map(([skill, data]) => ({
    skill,
    subskill: data.subskill,
    correct: data.correct,
    total: data.total,
    percentage: Math.round((data.correct / data.total) * 100),
  }))
}


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
  startTimer: () => void
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
    timeRemaining: TIME_PER_QUESTION,
    timeElapsed: 0,
    testStartTime: undefined,
    lastPassedLevel: undefined,
  })

  // Update elapsed time every second
  useEffect(() => {
    if (!state.testStartTime || state.isComplete) {
      return
    }

    const interval = setInterval(() => {
      setState(prev => {
        const elapsed = prev.testStartTime ? Math.floor((Date.now() - prev.testStartTime) / 1000) : 0
        return { ...prev, timeElapsed: elapsed }
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [state.testStartTime, state.isComplete])

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
        timeRemaining: TIME_PER_QUESTION,
        // Store the level that was just passed
        lastPassedLevel: prev.currentLevel ?? undefined,
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
        timeRemaining: TIME_PER_QUESTION,
        timeElapsed: 0,
        testStartTime: Date.now(),
      })
      return
    } else if (level) {
      const response = await fetch(`/questions/${level.toLowerCase()}.json`)
      const data = await response.json()
      questions = getRandomQuestionsFromUtil(data.questions, 10)
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
      timeRemaining: TIME_PER_QUESTION,
      timeElapsed: 0,
      testStartTime: Date.now(),
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
    setState(prev => ({ ...prev, currentQuestionIndex: index, timeRemaining: TIME_PER_QUESTION }))
  }, [])

  const nextQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.min(prev.currentQuestionIndex + 1, prev.questions.length - 1),
      timeRemaining: TIME_PER_QUESTION
    }))
  }, [])

  const previousQuestion = useCallback(() => {
    setState(prev => ({
      ...prev,
      currentQuestionIndex: Math.max(prev.currentQuestionIndex - 1, 0),
      timeRemaining: TIME_PER_QUESTION
    }))
  }, [])

  const completeTest = useCallback(() => {
    setState(prev => {
      let result: TestResult

      if (prev.testType === 'placement') {
        // Calculate correct count for current level
        let correctCount = 0
        for (const question of prev.questions) {
          const answer = prev.answers.get(question.id)
          if (answer && checkAnswer(question, answer)) {
            correctCount++
          }
        }

        // Check if current level was passed
        const passed = checkLevelPassThreshold(prev.questions, prev.answers)

        // Determine final level:
        // - If passed: use current level
        // - If failed: use lastPassedLevel (or 'A0' if null)
        let finalLevel: CEFRLevel
        if (passed) {
          finalLevel = prev.currentLevel!
        } else {
          finalLevel = prev.lastPassedLevel ?? 'A0'
        }

        // Calculate skill breakdown
        const skillBreakdown = calculateSkillBreakdown(prev.questions, prev.answers)

        // Build result with failed level info if applicable
        result = {
          testType: 'placement',
          level: finalLevel,
          recommendations: generateRecommendations(finalLevel),
          completedAt: new Date(),
          skillBreakdown,
        }

        // Add failed level info if test was failed
        if (!passed) {
          result.failedLevel = prev.currentLevel!
          result.failedLevelCorrect = correctCount
          result.failedLevelTotal = prev.questions.length
        }
      } else {
        // Calculate level test result
        const scoreResult = calculateLevelTestScore(prev.questions, prev.answers)

        // Calculate skill breakdown
        const skillBreakdown = calculateSkillBreakdown(prev.questions, prev.answers)

        result = {
          testType: 'level',
          level: prev.level,
          score: scoreResult.score,
          passed: scoreResult.passed,
          recommendations: generateRecommendations(scoreResult),
          completedAt: new Date(),
          skillBreakdown,
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
      timeRemaining: TIME_PER_QUESTION,
      timeElapsed: 0,
      testStartTime: undefined,
      lastPassedLevel: undefined,
    })
  }, [])

  const startTimer = useCallback(() => {
    setState(prev => ({ ...prev, timeRemaining: TIME_PER_QUESTION }))
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
        startTimer,
      }}
    >
      {children}
    </TestContext.Provider>
  )
}
