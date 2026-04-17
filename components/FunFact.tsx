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

  useEffect(() => {
    fetch('/facts.json')
      .then(res => res.json())
      .then((data: FactsResponse) => {
        setFacts(data.facts)
        setLoading(false)
      })
      .catch(() => {
        setLoading(false)
      })
  }, [])

  const randomFact = useMemo(() => {
    if (facts.length === 0) return null
    const index = Math.floor(Math.random() * facts.length)
    return facts[index]
  }, [facts])

  const displayFact = randomFact?.text || DEFAULT_FACT

  return (
    <div className="max-w-2xl mx-auto mt-8 text-center">
      <p className="text-sm text-muted-foreground">
        {loading ? 'Loading fun fact...' : `Did you know? - ${displayFact}`}
      </p>
    </div>
  )
}
