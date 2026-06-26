'use client'

import { useState } from 'react'
import { deleteSeries } from '@/app/actions/series'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

type Scope = 'template' | 'cascade'

export function DeleteSeriesButton({ id, title }: { id: string; title: string }) {
  // Same guard as DeleteSessionButton: only one of the two scoped deletes
  // can be armed at a time, since both act on the same series row.
  const [armed, setArmed] = useState<Scope | null>(null)

  return (
    <div className="space-y-2">
      <ConfirmDeleteButton
        label="Eliminar solo el molde (conservar sesiones)"
        pendingMessage={`"${title}" se eliminará. Las sesiones ya generadas quedarán como sesiones sueltas.`}
        onConfirm={() => deleteSeries(id, false)}
        disabled={armed !== null && armed !== 'template'}
        onPendingChange={(pending) => setArmed(pending ? 'template' : null)}
      />

      <ConfirmDeleteButton
        label="Eliminar serie y todas sus sesiones"
        pendingMessage={`"${title}" y todas sus sesiones (pasadas y futuras, con su asistencia) se eliminarán.`}
        onConfirm={() => deleteSeries(id, true)}
        undoWindowMs={7000}
        disabled={armed !== null && armed !== 'cascade'}
        onPendingChange={(pending) => setArmed(pending ? 'cascade' : null)}
        className="w-full py-2.5 text-sm text-white bg-red-500 rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      />
    </div>
  )
}
