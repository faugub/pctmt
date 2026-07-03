'use client'

import { deletePair } from '@/app/actions/pairs'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeletePairButton({ id, label }: { id: string; label: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar sociedad"
      pendingMessage={`La sociedad "${label}" se eliminará.`}
      onConfirm={() => deletePair(id)}
    />
  )
}
