'use client'

import { deleteBlock } from '@/app/actions/blocks'

export function DeleteBlockButton({ id, title }: { id: string; title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar el bloque "${title}"?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteBlock.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar bloque
      </button>
    </form>
  )
}
