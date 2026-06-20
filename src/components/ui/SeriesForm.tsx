'use client'

const WEEKDAYS = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
]

const SESSION_TYPES = [
  { value: 'academy',    label: 'Academia' },
  { value: 'individual', label: 'Individual' },
  { value: 'pairs',      label: 'Parejas' },
]

type Player = { id: string; full_name: string }

type DefaultValues = {
  title?: string
  session_type?: string
  category?: string | null
  level?: string | null
  recurrence_days?: number[]
  start_time?: string
  duration_min?: number | null
  starts_on?: string
  ends_on?: string | null
  player_ids?: string[]
  notes?: string | null
}

export function SeriesForm({
  action,
  players,
  defaultValues = {},
  submitLabel = 'Crear serie',
  showStartsOn = true,
}: {
  action: (formData: FormData) => Promise<void>
  players: Player[]
  defaultValues?: DefaultValues
  submitLabel?: string
  showStartsOn?: boolean
}) {
  const selectedDays = new Set(defaultValues.recurrence_days ?? [])
  const selectedPlayers = new Set(defaultValues.player_ids ?? [])

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
          placeholder="Ej. Academia B1"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo <span className="text-red-500">*</span>
        </label>
        <select
          name="session_type"
          required
          defaultValue={defaultValues.session_type ?? ''}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="" disabled>Selecciona un tipo</option>
          {SESSION_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
          <input
            name="category"
            type="text"
            defaultValue={defaultValues.category ?? ''}
            placeholder="masculino 3a"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Nivel</label>
          <input
            name="level"
            type="text"
            defaultValue={defaultValues.level ?? ''}
            placeholder="4a"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Días de la semana <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2 flex-wrap">
          {WEEKDAYS.map((d) => (
            <label
              key={d.value}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 rounded-full cursor-pointer hover:bg-gray-100 transition-colors text-sm"
            >
              <input
                type="checkbox"
                name="recurrence_days"
                value={d.value}
                defaultChecked={selectedDays.has(d.value)}
                className="rounded border-gray-300 text-gray-900 focus:ring-gray-400"
              />
              {d.label}
            </label>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Hora <span className="text-red-500">*</span>
          </label>
          <input
            name="start_time"
            type="time"
            required
            defaultValue={defaultValues.start_time ?? ''}
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
            defaultValue={defaultValues.duration_min ?? 60}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {showStartsOn && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Empieza el <span className="text-red-500">*</span>
            </label>
            <input
              name="starts_on"
              type="date"
              required
              defaultValue={defaultValues.starts_on ?? new Date().toISOString().split('T')[0]}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
            />
          </div>
        )}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Termina el</label>
          <input
            name="ends_on"
            type="date"
            defaultValue={defaultValues.ends_on ?? ''}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
          <p className="text-xs text-gray-400 mt-1">Déjalo vacío si no tiene fecha de fin</p>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          name="notes"
          rows={2}
          defaultValue={defaultValues.notes ?? ''}
          placeholder="Observaciones generales de la serie..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      {players.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Alumnos regulares</p>
          <p className="text-xs text-gray-400 mb-2">
            Roster por defecto para cada sesión generada. Puedes ajustar la lista sesión por sesión después.
          </p>
          <div className="space-y-2">
            {players.map((p) => (
              <label key={p.id} className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition-colors">
                <input
                  type="checkbox"
                  name="player_ids"
                  value={p.id}
                  defaultChecked={selectedPlayers.has(p.id)}
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
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
