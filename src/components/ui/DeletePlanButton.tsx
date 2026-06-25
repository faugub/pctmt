'use client'

import { deletePlan } from '@/app/actions/plans'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeletePlanButton({ id, title }: { id: string; title: string }) {
  return (
    <ConfirmDeleteButton
      label="Eliminar plan"
      pendingMessage={`"${title}" se eliminará. Las sesiones reales vinculadas no se borran.`}
      onConfirm={() => deletePlan(id)}
    />
  )
}
