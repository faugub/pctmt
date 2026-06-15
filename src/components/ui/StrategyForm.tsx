'use client'

const ZONES = [
  { value: 'red',      label: 'Red' },
  { value: 'midcourt', label: 'Mediocampo' },
  { value: 'back',     label: 'Fondo' },
  { value: 'full',     label: 'Campo completo' },
]

type DefaultValues = {
  title?: string
  court_zone?: string | null
  description?: string | null
  tags?: string[] | null
}

export function StrategyForm({
  action,
  defaultValues = {},
  submitLabel = 'Guardar',
}: {
  action: (formData: FormData) => Promise<void>
  defaultValues?: DefaultValues
  submitLabel?: string
}) {
  const tagsDefault = defaultValues.tags?.join(', ') ?? ''

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
          defaultValue={defaultValues.title ?? ''}
          placeholder="Ej. Bajada de bandeja por el centro"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Zona del campo</label>
        <select
          name="court_zone"
          defaultValue={defaultValues.court_zone ?? ''}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="">—</option>
          {ZONES.map((z) => (
            <option key={z.value} value={z.value}>{z.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="description"
          rows={5}
          defaultValue={defaultValues.description ?? ''}
          placeholder="Describe la jugada, el movimiento, la situación táctica..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
        <input
          name="tags"
          type="text"
          defaultValue={tagsDefault}
          placeholder="smash, bandeja, volea — separadas por coma"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1">Separa las etiquetas con comas</p>
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
