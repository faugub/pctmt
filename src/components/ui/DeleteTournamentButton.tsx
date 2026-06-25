'use client'

import { deleteTournament } from '@/app/actions/tournaments'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteTournamentButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar competencia"
      pendingMessage={`"${name}" y sus resultados se eliminarán.`}
      onConfirm={() => deleteTournament(id)}
    />
  )
}
