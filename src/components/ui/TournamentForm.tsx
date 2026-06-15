'use client'

const ZONES = [
  { value: 'red',      label: 'Red' },
  { value: 'midcourt', label: 'Mediocampo' },
  { value: 'back',     label: 'Fondo' },
  { value: 'full',     label: 'Campo completo' },
]

type DefaultValues = {
  name?: string
  start_date?: string
  end_date?: string | null
  location?: string | null
  category?: string | null
}

export function TournamentForm({
  action,
  defaultValues = {},
  submitLabel = 'Crear torneo',
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: DefaultValues
  submitLabel?: string
}) {
  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre <span className="text-red-500">*</span>
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={defaultValues.name ?? ''}
          placeholder="Ej. Open Ciudad de Madrid"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha inicio <span className="text-red-500">*</span>
          </label>
          <input
            name="start_date"
            type="date"
            required
            defaultValue={defaultValues.start_date ?? new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Fecha fin</label>
          <input
            name="end_date"
            type="date"
            defaultValue={defaultValues.end_date ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ubicación</label>
        <input
          name="location"
          type="text"
          defaultValue={defaultValues.location ?? ''}
          placeholder="Ej. Club Pádel Norte, Madrid"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
        <input
          name="category"
          type="text"
          defaultValue={defaultValues.category ?? ''}
          placeholder="Ej. Masculino 3ª, Femenino 4ª, Mixto"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
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
