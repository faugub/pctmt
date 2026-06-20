import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeletePlayerButton } from '@/components/ui/DeletePlayerButton'
import { DeleteSnapshotButton } from '@/components/ui/DeleteSnapshotButton'
import { ProgressChart } from '@/components/ui/ProgressChart'
import { SharePanel } from '@/components/ui/SharePanel'

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciación',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  competition: 'Competición',
}

const HAND_LABEL: Record<string, string> = {
  right: 'Derecha',
  left: 'Izquierda',
}

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  physical:  'Física',
  tactical:  'Táctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
}

function calcAge(dateStr: string | null) {
  if (!dateStr) return null
  const birth = new Date(dateStr)
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return age
}

function ScoreBadge({ value }: { value: number | null }) {
  if (value === null) return <span className="text-gray-300">—</span>
  const color =
    value >= 8 ? 'bg-green-100 text-green-700'
    : value >= 5 ? 'bg-yellow-100 text-yellow-700'
    : 'bg-red-100 text-red-600'
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
      {value}
    </span>
  )
}

type SnapshotRow = {
  id: string
  recorded_at: string
  weight_kg: number | null
  height_cm: number | null
  endurance_score: number | null
  speed_score: number | null
  strength_score: number | null
  technique_score: number | null
  notes: string | null
}

type SessionAttendance = {
  attended: boolean
  sessions: { id: string; title: string; session_date: string; session_type: string | null } | null
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !player) notFound()

  const { data: snapshots } = await supabase
    .from('player_snapshots')
    .select('*')
    .eq('player_id', id)
    .order('recorded_at', { ascending: false }) as { data: SnapshotRow[] | null }

  const { data: attendance } = await supabase
    .from('session_players')
    .select('attended, sessions(id, title, session_date, session_type)')
    .eq('player_id', id)
    .order('sessions(session_date)', { ascending: false }) as { data: SessionAttendance[] | null }

  const age = calcAge(player.birth_date)
  const chartSnapshots = [...(snapshots ?? [])].reverse()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/players" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Jugadores
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{player.full_name}</h1>
            {player.level && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                {LEVEL_LABEL[player.level] ?? player.level}
              </span>
            )}
          </div>
          <Link
            href={`/players/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors"
          >
            Editar
          </Link>
        </div>

        {/* Profile data */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm divide-y divide-gray-50">
          {[
            {
              label: 'Fecha de nacimiento',
              value: `${formatDate(player.birth_date)}${age !== null ? ` (${age} años)` : ''}`,
            },
            { label: 'Mano dominante', value: player.dominant_hand ? (HAND_LABEL[player.dominant_hand] ?? player.dominant_hand) : '—' },
            { label: 'Peso', value: player.weight_kg ? `${player.weight_kg} kg` : '—' },
            { label: 'Altura', value: player.height_cm ? `${player.height_cm} cm` : '—' },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between items-center px-5 py-4">
              <span className="text-sm text-gray-500">{label}</span>
              <span className="text-sm font-medium text-gray-900">{value}</span>
            </div>
          ))}
        </div>

        {/* Progress chart */}
        {chartSnapshots.length >= 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Progreso</h2>
            <ProgressChart snapshots={chartSnapshots} playerName={player.full_name} />
          </div>
        )}

        {/* Shareable profile */}
        <SharePanel
          playerId={id}
          shareEnabled={player.share_enabled}
          shareToken={player.share_token}
        />

        {/* Snapshots */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Historial de snapshots</h2>
            <Link
              href={`/players/${id}/snapshots/new`}
              className="text-sm px-3 py-1.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Nuevo
            </Link>
          </div>

          {snapshots && snapshots.length > 0 ? (
            <ul className="space-y-3">
              {snapshots.map((s) => (
                <li key={s.id} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-900">{formatDate(s.recorded_at)}</span>
                    <DeleteSnapshotButton snapshotId={s.id} playerId={id} date={formatDate(s.recorded_at)} />
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                    {s.weight_kg && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Peso</span>
                        <span className="font-medium text-gray-900">{s.weight_kg} kg</span>
                      </div>
                    )}
                    {s.height_cm && (
                      <div className="flex justify-between">
                        <span className="text-gray-500">Altura</span>
                        <span className="font-medium text-gray-900">{s.height_cm} cm</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Resistencia</span>
                      <ScoreBadge value={s.endurance_score} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Velocidad</span>
                      <ScoreBadge value={s.speed_score} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Fuerza</span>
                      <ScoreBadge value={s.strength_score} />
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-500">Técnica</span>
                      <ScoreBadge value={s.technique_score} />
                    </div>
                  </div>
                  {s.notes && (
                    <p className="mt-3 text-xs text-gray-400 border-t border-gray-50 pt-3">{s.notes}</p>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-10 text-gray-400 bg-white border border-gray-100 rounded-2xl">
              <p className="text-3xl mb-2">📊</p>
              <p className="text-sm">Sin snapshots todavía.</p>
              <Link href={`/players/${id}/snapshots/new`} className="text-sm text-gray-900 underline mt-1 inline-block">
                Registrar el primero
              </Link>
            </div>
          )}
        </div>

        {/* Session attendance */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-4">Sesiones</h2>
          {attendance && attendance.length > 0 ? (
            <ul className="space-y-2">
              {attendance.map((a, i) => {
                const s = a.sessions
                if (!s) return null
                return (
                  <li key={i}>
                    <Link
                      href={`/sessions/${s.id}`}
                      className="flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatShortDate(s.session_date)}
                          {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                        </p>
                      </div>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                        a.attended ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                      }`}>
                        {a.attended ? 'Asistió' : 'Faltó'}
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ul>
          ) : (
            <p className="text-sm text-gray-400 text-center py-6 bg-white border border-gray-100 rounded-2xl">
              No ha participado en ninguna sesión todavía.
            </p>
          )}
        </div>

        {/* Delete player */}
        <div className="pt-2">
          <DeletePlayerButton id={id} name={player.full_name} />
        </div>

      </main>
    </div>
  )
}
