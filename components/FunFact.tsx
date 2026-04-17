'use client'

import { useEffect, useState, useMemo } from 'react'

interface Fact {
  text: string
  category: string
}

interface FactsResponse {
  facts: Fact[]
}

const DEFAULT_FACT = "Did you know? Learning a new language can improve your memory and problem-solving skills!"

export function FunFact() {
  const [facts, setFacts] = useState<Fact[]>([])
  const [loading, setLoading] = useState(true)
  const [randomIndex, setRandomIndex] = useState(0)

  useEffect(() => {
    fetch('/facts.json')
      .then(res => res.json())
      .then((data: FactsResponse) => {
        setFacts(data.facts)
        setRandomIndex(Math.floor(Math.random() * data.facts.length))
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const randomFact = useMemo(() => {
    if (facts.length === 0) return null
    return facts[randomIndex]
  }, [facts, randomIndex])

  const displayFact = randomFact?.text || DEFAULT_FACT

  return (
    <div className="max-w-2xl mx-auto mt-8 ">
  {loading ? (
    <p className="text-sm text-muted-foreground text-center animate-pulse">
      Loading fun fact...
    </p>
  ) : (
    <div className="text-center rounded-lg p-4">
      <p className="text-sm inline">
        <span className="font-semibold text-blue-700">Did you know?</span>{' '}
        {displayFact}
      </p>
    </div>
  )}
</div>
  )
}
