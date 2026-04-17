'use client'

import { useEffect, useState, useMemo } from 'react'
import { Lightbulb } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

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
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="bg-muted/50 border-muted-foreground/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Lightbulb className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Did you know?
              </p>
              <p className="text-sm text-muted-foreground">
                {loading ? 'Loading fun fact...' : displayFact}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
