'use client'

import { deleteSeries } from '@/app/actions/series'

export function DeleteSeriesButton({ id, title }: { id: string; title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la serie "${title}"? Las sesiones ya generadas quedarán como sesiones sueltas, no se borran.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteSeries.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar serie
      </button>
    </form>
  )
}
