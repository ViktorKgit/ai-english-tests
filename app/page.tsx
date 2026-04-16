'use client'

import { useTest } from '@/components/test/TestProvider'
import { HomePage } from '@/components/test/HomePage'
import { PlacementTest } from '@/components/test/PlacementTest'
import { LevelTest } from '@/components/test/LevelTest'
import { Results } from '@/components/test/Results'

export default function Home() {
  const { testType, isComplete } = useTest()

  if (isComplete) {
    return <Results />
  }

  if (!testType) {
    return <HomePage />
  }

  if (testType === 'placement') {
    return <PlacementTest />
  }

  return <LevelTest />
}
