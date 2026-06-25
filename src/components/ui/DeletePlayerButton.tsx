'use client'

import { deletePlayer } from '@/app/actions/players'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeletePlayerButton({ id, name }: { id: string; name: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar jugador"
      pendingMessage={`${name} se eliminará.`}
      onConfirm={() => deletePlayer(id)}
    />
  )
}
