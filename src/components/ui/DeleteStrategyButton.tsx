'use client'

import { deleteStrategy } from '@/app/actions/strategies'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteStrategyButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar estrategia"
      pendingMessage={`"${title}" se eliminará.`}
      onConfirm={() => deleteStrategy(id)}
    />
  )
}
