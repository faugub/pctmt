'use client'

import { useState } from 'react'

type Series = { id: string; title: string }
type Player = { id: string; full_name: string }

export function PlanForm({
  action,
  series,
  players,
  submitLabel = 'Crear plan',
}: {
  action: (formData: FormData) => Promise<void>
  series: Series[]
  players: Player[]
  submitLabel?: string
}) {
  const [targetType, setTargetType] = useState<'group' | 'individual'>('group')

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="Ej. Ciclo de técnica de volea"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Este plan es para <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setTargetType('group')}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              targetType === 'group' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            Un grupo (serie)
          </button>
          <button
            type="button"
            onClick={() => setTargetType('individual')}
            className={`flex-1 py-2 text-sm rounded-lg border transition-colors ${
              targetType === 'individual' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 text-gray-600'
            }`}
          >
            Un jugador
          </button>
        </div>
        <input type="hidden" name="target_type" value={targetType} />
      </div>

      {targetType === 'group' ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Serie <span className="text-red-500">*</span>
          </label>
          <select
            name="target_id"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="" disabled>Selecciona una serie</option>
            {series.map((s) => (
              <option key={s.id} value={s.id}>{s.title}</option>
            ))}
          </select>
          {series.length === 0 && (
            <p className="text-xs text-amber-600 mt-1">No tienes series creadas todavía.</p>
          )}
        </div>
      ) : (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Jugador <span className="text-red-500">*</span>
          </label>
          <select
            name="target_id"
            required
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="" disabled>Selecciona un jugador</option>
            {players.map((p) => (
              <option key={p.id} value={p.id}>{p.full_name}</option>
            ))}
          </select>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Número de sesiones <span className="text-red-500">*</span>
          </label>
          <input
            name="total_sessions"
            type="number"
            min="1"
            required
            defaultValue={12}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Empieza el <span className="text-red-500">*</span>
          </label>
          <input
            name="starts_on"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Objetivo del plan</label>
        <textarea
          name="goal_description"
          rows={2}
          placeholder="¿A dónde quieres llegar al final de las sesiones?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="description"
          rows={2}
          placeholder="Notas generales del plan..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
