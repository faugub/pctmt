'use client'

import { useState } from 'react'
import { deleteSeriesOccurrence } from '@/app/actions/series'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

type Scope = 'this' | 'future' | 'all'

export function DeleteSessionButton({
  id,
  title,
  seriesId,
}: {
  id: string
  title: string
  seriesId?: string | null
}) {
  // Only one of the three scoped deletes can be "armed" (counting down to
  // execution) at a time. While one is armed, the others are disabled —
  // otherwise a coach could schedule two overlapping deletes (e.g. "future"
  // then "all") that race against the same rows in series.ts.
  const [armed, setArmed] = useState<Scope | null>(null)

  // One-off session (not part of a series): keep the simple single button.
  if (!seriesId) {
    return (
      <ConfirmDeleteButton
        label="Eliminar sesión"
        pendingMessage={`"${title}" se eliminará.`}
        onConfirm={() => deleteSeriesOccurrence(id, 'this')}
      />
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-gray-400 px-1">Esta sesión es parte de una serie recurrente.</p>

      <ConfirmDeleteButton
        label="Eliminar solo esta sesión"
        pendingMessage={`"${title}" se eliminará.`}
        onConfirm={() => deleteSeriesOccurrence(id, 'this')}
        disabled={armed !== null && armed !== 'this'}
        onPendingChange={(pending) => setArmed(pending ? 'this' : null)}
      />

      <ConfirmDeleteButton
        label="Eliminar esta y las futuras"
        pendingMessage={`"${title}" y todas las sesiones futuras de esta serie se eliminarán. Las pasadas se conservan.`}
        onConfirm={() => deleteSeriesOccurrence(id, 'future')}
        disabled={armed !== null && armed !== 'future'}
        onPendingChange={(pending) => setArmed(pending ? 'future' : null)}
      />

      <ConfirmDeleteButton
        label="Eliminar toda la serie"
        pendingMessage="Toda la serie se eliminará: sesiones pasadas y futuras, con su asistencia."
        onConfirm={() => deleteSeriesOccurrence(id, 'all')}
        undoWindowMs={7000}
        disabled={armed !== null && armed !== 'all'}
        onPendingChange={(pending) => setArmed(pending ? 'all' : null)}
        className="w-full py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
