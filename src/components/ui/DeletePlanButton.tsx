'use client'

import { deletePlan } from '@/app/actions/plans'

export function DeletePlanButton({ id, title }: { id: string; title: string }) {
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    if (!confirm(`¿Eliminar el plan "${title}"? Las sesiones reales vinculadas no se borran.`)) {
      e.preventDefault()
    }
  }

  return (
    <form action={deletePlan.bind(null, id)} onSubmit={handleSubmit}>
      <button
        type="submit"
        className="w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors"
      >
        Eliminar plan
      </button>
    </form>
  )
}
