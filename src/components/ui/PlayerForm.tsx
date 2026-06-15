'use client'

import { useRef } from 'react'

type PlayerFormProps = {
  action: (formData: FormData) => Promise<void>
  defaultValues?: {
    full_name?: string
    birth_date?: string | null
    dominant_hand?: string | null
    level?: string | null
    weight_kg?: number | null
    height_cm?: number | null
  }
  submitLabel?: string
}

export function PlayerForm({ action, defaultValues = {}, submitLabel = 'Guardar' }: PlayerFormProps) {
  const formRef = useRef<HTMLFormElement>(null)

  return (
    <form ref={formRef} action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre completo <span className="text-red-500">*</span>
        </label>
        <input
          name="full_name"
          type="text"
          required
          defaultValue={defaultValues.full_name ?? ''}
          placeholder="Ej. Carlos García"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de nacimiento</label>
          <input
            name="birth_date"
            type="date"
            defaultValue={defaultValues.birth_date ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mano dominante</label>
          <select
            name="dominant_hand"
            defaultValue={defaultValues.dominant_hand ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
          >
            <option value="">—</option>
            <option value="right">Derecha</option>
            <option value="left">Izquierda</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
        <select
          name="level"
          defaultValue={defaultValues.level ?? ''}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="">—</option>
          <option value="beginner">Iniciación</option>
          <option value="intermediate">Intermedio</option>
          <option value="advanced">Avanzado</option>
          <option value="competition">Competición</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
          <input
            name="weight_kg"
            type="number"
            step="0.1"
            min="0"
            defaultValue={defaultValues.weight_kg ?? ''}
            placeholder="70.0"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
          <input
            name="height_cm"
            type="number"
            step="1"
            min="0"
            defaultValue={defaultValues.height_cm ?? ''}
            placeholder="175"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
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
