'use client'

import { deleteResult } from '@/app/actions/tournaments'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteResultButton({
  resultId,
  tournamentId,
  playerName,
}: {
  resultId: string
  tournamentId: string
  playerName: string
}) {
  return (
    <ConfirmDeleteButton
      label="Eliminar"
      pendingMessage={`Resultado de ${playerName} se eliminará.`}
      onConfirm={() => deleteResult(resultId, tournamentId)}
      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}
