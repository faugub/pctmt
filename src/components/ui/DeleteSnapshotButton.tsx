'use client'

import { deleteSnapshot } from '@/app/actions/snapshots'
import { ConfirmDeleteButton } from '@/components/ui/ConfirmDeleteButton'

export function DeleteSnapshotButton({
  snapshotId,
  playerId,
  date,
}: {
  snapshotId: string
  playerId: string
  date: string
}) {
  return (
    <ConfirmDeleteButton
      label="Eliminar"
      pendingMessage={`Snapshot del ${date} se eliminará.`}
      onConfirm={() => deleteSnapshot(snapshotId, playerId)}
      className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    />
  )
}
