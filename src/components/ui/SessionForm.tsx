'use client'

type Player = { id: string; full_name: string }

type Props = {
  action: (formData: FormData) => Promise<void>
  players: Player[]
}

const SESSION_TYPES = [
  { value: 'technical', label: 'Técnica' },
  { value: 'physical',  label: 'Física' },
  { value: 'tactical',  label: 'Táctica' },
  { value: 'match',     label: 'Partido' },
  { value: 'mixed',     label: 'Mixta' },
]

export function SessionForm({ action, players }: Props) {
  return (
    <form action={action} className="space-y-5">
      {/* Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          placeholder="Ej. Entrenamiento de volea"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {/* Date + Duration */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha <span className="text-red-500">*</span>
          </label>
          <input
            name="session_date"
            type="date"
            required
            defaultValue={new Date().toISOString().split('T')[0]}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
          <input
            name="duration_min"
            type="number"
            min="0"
            step="5"
            placeholder="90"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      {/* Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
        <select
          name="session_type"
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="">—</option>
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      {/* Objectives */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Objetivos</label>
        <textarea
          name="objectives"
          rows={2}
          placeholder="¿Qué trabajamos hoy?"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Observaciones generales..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      {/* Players */}
      {players.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Jugadores convocados</p>
          <div className="space-y-2">
            {players.map((p) => (
              <label key={p.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="player_ids"
                  value={p.id}
                  defaultChecked
                  className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
                />
                <span className="text-sm text-gray-800">{p.full_name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          Crear sesión
        </button>
      </div>
    </form>
  )
}
