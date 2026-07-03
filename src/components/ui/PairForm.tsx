'use client'

type Player = { id: string; full_name: string }

type Props = {
  action: (formData: FormData) => Promise<void>
  players: Player[]
  submitLabel: string
  editMode?: boolean
  defaultValues?: {
    player1_id?: string
    player2_id?: string
    name?: string
    notes?: string
  }
}

const inputClass =
  'w-full border border-border rounded-xl px-4 py-3 text-sm bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary'
const labelClass = 'block text-sm font-medium text-foreground mb-1.5'

export function PairForm({ action, players, submitLabel, editMode = false, defaultValues }: Props) {
  return (
    <form action={action} className="space-y-5">
      {!editMode && (
        <>
          <div>
            <label className={labelClass}>Jugador 1</label>
            <select
              name="player1_id"
              required
              defaultValue={defaultValues?.player1_id ?? ''}
              className={inputClass}
            >
              <option value="" disabled>Seleccionar jugador…</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelClass}>Jugador 2</label>
            <select
              name="player2_id"
              required
              defaultValue={defaultValues?.player2_id ?? ''}
              className={inputClass}
            >
              <option value="" disabled>Seleccionar jugador…</option>
              {players.map(p => (
                <option key={p.id} value={p.id}>{p.full_name}</option>
              ))}
            </select>
          </div>
        </>
      )}

      <div>
        <label className={labelClass}>
          Nombre de la sociedad{' '}
          <span className="font-normal text-muted-foreground">(opcional)</span>
        </label>
        <input
          type="text"
          name="name"
          defaultValue={defaultValues?.name ?? ''}
          placeholder="ej. Los Cracks"
          className={inputClass}
        />
      </div>

      <div>
        <label className={labelClass}>
          Notas{' '}
          <span className="font-normal text-muted-foreground">
            (complementariedad, patrones tácticos, evolución)
          </span>
        </label>
        <textarea
          name="notes"
          defaultValue={defaultValues?.notes ?? ''}
          rows={5}
          placeholder="¿Cómo se complementan? ¿Qué patrones trabajan? ¿Qué sigue pendiente?"
          className={`${inputClass} resize-y`}
        />
      </div>

      <button
        type="submit"
        className="w-full py-3 bg-primary text-primary-foreground text-sm font-medium rounded-xl hover:opacity-90 transition-opacity"
      >
        {submitLabel}
      </button>
    </form>
  )
}
