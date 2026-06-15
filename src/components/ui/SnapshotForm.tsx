'use client'

type Props = {
  action: (formData: FormData) => Promise<void>
}

const SCORE_FIELDS = [
  { name: 'endurance_score', label: 'Resistencia' },
  { name: 'speed_score',     label: 'Velocidad' },
  { name: 'strength_score',  label: 'Fuerza' },
  { name: 'technique_score', label: 'Técnica' },
] as const

export function SnapshotForm({ action }: Props) {
  return (
    <form action={action} className="space-y-6">
      {/* Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha <span className="text-red-500">*</span>
        </label>
        <input
          name="recorded_at"
          type="date"
          required
          defaultValue={new Date().toISOString().split('T')[0]}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Physical */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Físico</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              min="0"
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
              placeholder="175"
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        </div>
      </div>

      {/* Scores */}
      <div>
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Scores (1–10)</p>
        <div className="grid grid-cols-2 gap-4">
          {SCORE_FIELDS.map(({ name, label }) => (
            <div key={name}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                name={name}
                type="number"
                min="1"
                max="10"
                step="1"
                placeholder="—"
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          name="notes"
          rows={3}
          placeholder="Observaciones sobre este registro..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        Guardar snapshot
      </button>
    </form>
  )
}
