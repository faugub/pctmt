'use client'

type Player = { id: string; full_name: string }

const ROUNDS = [
  { value: 'winner',       label: '🏆 Campeón' },
  { value: 'final',        label: 'Final' },
  { value: 'semifinal',    label: 'Semifinal' },
  { value: 'quarterfinal', label: 'Cuartos de final' },
  { value: 'groups',       label: 'Fase de grupos' },
]

export function ResultForm({
  action,
  players,
}: {
  action: (formData: FormData) => Promise<void>
  players: Player[]
}) {
  return (
    <form action={action} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Jugador <span className="text-red-500">*</span>
        </label>
        <select
          name="player_id"
          required
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="" disabled>Selecciona un jugador</option>
          {players.map((p) => (
            <option key={p.id} value={p.id}>{p.full_name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Compañero/a de pareja</label>
        <input
          name="partner_name"
          type="text"
          placeholder="Nombre del compañero"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Ronda alcanzada</label>
        <select
          name="final_round"
          defaultValue=""
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="">—</option>
          {ROUNDS.map((r) => (
            <option key={r.value} value={r.value}>{r.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sets ganados</label>
          <input
            name="sets_won"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Sets perdidos</label>
          <input
            name="sets_lost"
            type="number"
            min="0"
            defaultValue={0}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
        <textarea
          name="notes"
          rows={2}
          placeholder="Observaciones..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <button
        type="submit"
        className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
      >
        Añadir resultado
      </button>
    </form>
  )
}
