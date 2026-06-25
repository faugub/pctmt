'use client'

import { deleteBlock } from '@/app/actions/blocks'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteBlockButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar bloque"
      pendingMessage={`"${title}" se eliminará.`}
      onConfirm={() => deleteBlock(id)}
    />
  )
}
