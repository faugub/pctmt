'use client'

import { deleteSeries } from '@/app/actions/series'

export function DeleteSeriesButton({ id, title }: { id: string; title: string }) {
  const deleteTemplateOnly = deleteSeries.bind(null, id, false)
  const deleteWithSessions = deleteSeries.bind(null, id, true)

  const confirmTemplateOnly = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la serie "${title}"? Las sesiones ya generadas quedarán como sesiones sueltas, no se borran.`)) {
      e.preventDefault()
    }
  }

  const confirmWithSessions = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la serie "${title}" y TODAS sus sesiones generadas (pasadas y futuras)? Esto borra también la asistencia registrada. No se puede deshacer.`)) {
      e.preventDefault()
    }
  }

  return (
    <div className="space-y-2">
      <form action={deleteTemplateOnly} onSubmit={confirmTemplateOnly}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
        >
          Eliminar solo el molde (conservar sesiones)
        </button>
      </form>
      <form action={deleteWithSessions} onSubmit={confirmWithSessions}>
        <button
          type="submit"
          className="w-full py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors"
        >
          Eliminar serie y todas sus sesiones
        </button>
      </form>
    </div>
  )
}
