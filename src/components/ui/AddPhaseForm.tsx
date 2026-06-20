'use client'

import { useState } from 'react'

const COLOR_OPTIONS = [
  { value: '#3b82f6', label: 'Azul' },
  { value: '#10b981', label: 'Verde' },
  { value: '#f59e0b', label: 'Ámbar' },
  { value: '#8b5cf6', label: 'Morado' },
  { value: '#ef4444', label: 'Rojo' },
]

export function AddPhaseForm({ action }: { action: (formData: FormData) => Promise<void> }) {
  const [open, setOpen] = useState(false)

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-gray-500 hover:text-gray-900 transition-colors underline"
      >
        + Añadir fase
      </button>
    )
  }

  return (
    <form
      action={async (fd) => {
        await action(fd)
        setOpen(false)
      }}
      className="bg-gray-50 rounded-xl p-4 space-y-3"
    >
      <input
        name="title"
        type="text"
        required
        placeholder="Ej. Fase física"
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
      />
      <div className="grid grid-cols-2 gap-3">
        <input
          name="session_count"
          type="number"
          min="0"
          placeholder="Nº de sesiones"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <select
          name="color"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          {COLOR_OPTIONS.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
      </div>
      <textarea
        name="objectives"
        rows={2}
        placeholder="Objetivos de esta fase..."
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          className="flex-1 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
        >
          Añadir
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="px-4 py-2 text-sm text-gray-500 hover:text-gray-900 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </form>
  )
}
