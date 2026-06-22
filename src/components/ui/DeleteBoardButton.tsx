'use client'

import { deleteBoard } from '@/app/actions/boards'

export function DeleteBoardButton({ id, title }: { id: string; title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la pizarra "${title}"?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteBoard.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar pizarra
      </button>
    </form>
  )
}
