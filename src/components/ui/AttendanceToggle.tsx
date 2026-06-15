'use client'

import { useState, useTransition } from 'react'
import { updateAttendance } from '@/app/actions/sessions'

type Props = {
  sessionId: string
  playerId: string
  initialAttended: boolean
  playerName: string
}

export function AttendanceToggle({ sessionId, playerId, initialAttended, playerName }: Props) {
  const [attended, setAttended] = useState(initialAttended)
  const [isPending, startTransition] = useTransition()

  const toggle = () => {
    const next = !attended
    setAttended(next)
    startTransition(async () => {
      await updateAttendance(sessionId, playerId, next)
    })
  }

  return (
    <button
      onClick={toggle}
      disabled={isPending}
      className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl border transition-colors ${
        attended
          ? 'bg-green-50 border-green-100 text-green-800'
          : 'bg-gray-50 border-gray-100 text-gray-400 line-through'
      }`}
    >
      <span className={`w-4 h-4 rounded-full border-2 flex-shrink-0 ${
        attended ? 'bg-green-500 border-green-500' : 'border-gray-300'
      }`} />
      <span className="text-sm">{playerName}</span>
      {isPending && <span className="ml-auto text-xs text-gray-400">...</span>}
    </button>
  )
}
