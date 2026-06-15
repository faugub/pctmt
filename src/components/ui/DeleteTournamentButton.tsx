'use client'

import { deleteTournament } from '@/app/actions/tournaments'

export function DeleteTournamentButton({ id, name }: { id: string; name: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar el torneo "${name}"? Se borrarán todos sus resultados.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteTournament.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar torneo
      </button>
    </form>
  )
}
