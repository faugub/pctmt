'use client'

import { deleteBoard } from '@/app/actions/boards'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteBoardButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar pizarra"
      pendingMessage={`"${title}" se eliminará.`}
      onConfirm={() => deleteBoard(id)}
    />
  )
}
