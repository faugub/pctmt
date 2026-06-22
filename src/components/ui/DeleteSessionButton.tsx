'use client'

import { deleteSeriesOccurrence } from '@/app/actions/series'

export function DeleteSessionButton({
  id,
  title,
  seriesId,
}: {
  id: string
  title: string
  seriesId?: string | null
}) {
  const deleteThis = deleteSeriesOccurrence.bind(null, id, 'this')

  const confirmThis = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la sesión "${title}"?`)) {
      e.preventDefault()
    }
  }

  // One-off session (not part of a series): keep the simple single button.
  if (!seriesId) {
    return (
      <form action={deleteThis} onSubmit={confirmThis}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar sesión
        </button>
      </form>
    )
  }

  const deleteFuture = deleteSeriesOccurrence.bind(null, id, 'future')
  const deleteAll = deleteSeriesOccurrence.bind(null, id, 'all')

  const confirmFuture = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar "${title}" y todas las sesiones futuras de esta serie? Las sesiones pasadas se conservan.`)) {
      e.preventDefault()
    }
  }

  const confirmAll = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar TODA la serie, incluyendo sesiones pasadas y futuras y su asistencia? No se puede deshacer.`)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 px-1">Esta sesión es parte de una serie recurrente.</p>
      <form action={deleteThis} onSubmit={confirmThis}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar solo esta sesión
        </button>
      </form>
      <form action={deleteFuture} onSubmit={confirmFuture}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar esta y las futuras
        </button>
      </form>
      <form action={deleteAll} onSubmit={confirmAll}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Eliminar toda la serie
        </button>
      </form>
    </div>
  )
}
