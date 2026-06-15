'use client'

import { deleteSession } from '@/app/actions/sessions'

export function DeleteSessionButton({ id, title }: { id: string; title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar la sesión "${title}"?`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deleteSession.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar sesión
      </button>
    </form>
  )
}
