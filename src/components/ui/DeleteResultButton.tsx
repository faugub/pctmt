'use client'

import { deleteResult } from '@/app/actions/tournaments'

export function DeleteResultButton({
  resultId,
  tournamentId,
  playerName,
}: {
  resultId: string
  tournamentId: string
  playerName: string
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar el resultado de ${playerName}?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteResult.bind(null, resultId, tournamentId)} onSubmit={handleSubmit}>
      <button type="submit" className="text-xs text-red-400 hover:text-red-600 transition-colors">
        Eliminar
      </button>
    </form>
  )
}
