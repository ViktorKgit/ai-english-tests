'use client'

import { Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

interface TimerProps {
  timeElapsed?: number  // Time elapsed in seconds (for forward timer)
  timeRemaining?: number  // Time remaining in seconds (for backward timer)
  onTimeUp?: () => void  // Optional callback for backward timer
  mode?: 'elapsed' | 'remaining'  // Timer mode
}

export function Timer({ timeElapsed = 0, timeRemaining, onTimeUp, mode = 'remaining' }: TimerProps) {
  const [localTime, setLocalTime] = useState(mode === 'elapsed' ? timeElapsed : timeRemaining || 0)

  // Update local time when prop changes
  useEffect(() => {
    if (mode === 'elapsed') {
      setLocalTime(timeElapsed)
    } else if (timeRemaining !== undefined) {
      setLocalTime(timeRemaining)
    }
  }, [timeElapsed, timeRemaining, mode])

  // Countdown logic (only for remaining mode)
  useEffect(() => {
    if (mode === 'remaining') {
      if (localTime <= 0 && onTimeUp) {
        onTimeUp()
        return
      }

      const interval = setInterval(() => {
        setLocalTime(prev => {
          if (prev <= 1 && onTimeUp) {
            onTimeUp()
            return 0
          }
          return prev - 1
        })
      }, 1000)

      return () => clearInterval(interval)
    }
  }, [localTime, onTimeUp, mode])

  const minutes = Math.floor(localTime / 60)
  const seconds = localTime % 60

  // For elapsed time, always show neutral color
  // For remaining time, color based on urgency
  const getColorClass = () => {
    if (mode === 'elapsed') return 'text-slate-600 dark:text-slate-400'

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
