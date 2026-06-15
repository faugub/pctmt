'use client'

import { deleteSnapshot } from '@/app/actions/snapshots'

export function DeleteSnapshotButton({
  snapshotId,
  playerId,
  date,
}: {
  snapshotId: string
  playerId: string
  date: string
}) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar el snapshot del ${date}?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteSnapshot.bind(null, snapshotId, playerId)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="text-xs text-red-400 hover:text-red-600 transition-colors"
      >
        Eliminar
      </button>
    </form>
  )
}
