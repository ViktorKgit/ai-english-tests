'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TimerProps {
  timeRemaining: number
  onTimeUp: () => void
}

export function Timer({ timeRemaining, onTimeUp }: TimerProps) {
  const [localTime, setLocalTime] = useState(timeRemaining)

  useEffect(() => {
    setLocalTime(timeRemaining)
  }, [timeRemaining])

  useEffect(() => {
    if (localTime <= 0) {
      onTimeUp()
      return
    }

    const interval = setInterval(() => {
      setLocalTime(prev => {
        if (prev <= 1) {
          onTimeUp()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [localTime, onTimeUp])

  const minutes = Math.floor(localTime / 60)
  const seconds = localTime % 60

  // Color based on time remaining
  const getColorClass = () => {
    if (localTime > 60) return 'text-green-500'
    if (localTime > 30) return 'text-yellow-500'
    if (localTime > 10) return 'text-orange-500'
    return 'text-red-500 animate-pulse'
  }

  return (
    <div className={`flex items-center gap-2 ${getColorClass()}`}>
      <Clock className="h-5 w-5" />
      <span className="text-lg font-semibold tabular-nums">
        {minutes}:{seconds.toString().padStart(2, '0')}
      </span>
    </div>
  )
}
