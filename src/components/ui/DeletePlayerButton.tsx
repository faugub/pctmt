'use client'

import { deletePlayer } from '@/app/actions/players'

export function DeletePlayerButton({ id, name }: { id: string; name: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar a ${name}? Esta acción no se puede deshacer.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deletePlayer.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar jugador
      </button>
    </form>
  )
}
