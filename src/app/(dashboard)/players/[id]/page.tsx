import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeletePlayerButton } from '@/components/ui/DeletePlayerButton'
import { DeleteSnapshotButton } from '@/components/ui/DeleteSnapshotButton'
import { ProgressChart } from '@/components/ui/ProgressChart'
import { SharePanel } from '@/components/ui/SharePanel'
import { EmptyState } from '@/components/ui/EmptyState'

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
  if (value === null) return <span className="text-muted-foreground">—</span>
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
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href="/players" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Jugadores
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{player.full_name}</h1>
          {player.level && (
            <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
              {LEVEL_LABEL[player.level] ?? player.level}
            </span>
          )}
        </div>
        <Link
          href={`/players/${id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors"
        >
          Editar
        </Link>
      </div>

      {/* Profile data */}
      <div className="bg-card border border-border rounded-2xl shadow-sm divide-y divide-border">
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
            <span className="text-sm text-muted-foreground">{label}</span>
            <span className="text-sm font-medium text-foreground">{value}</span>
          </div>
        ))}
      </div>

      {/* Progress chart */}
      {chartSnapshots.length >= 2 && (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <h2 className="text-base font-semibold text-foreground mb-4">Progreso</h2>
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
          <h2 className="text-base font-semibold text-foreground">Historial de snapshots</h2>
          <Link
            href={`/players/${id}/snapshots/new`}
            className="text-sm px-3 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            + Nuevo
          </Link>
        </div>

        {snapshots && snapshots.length > 0 ? (
          <ul className="space-y-3">
            {snapshots.map((s) => (
              <li key={s.id} className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-foreground">{formatDate(s.recorded_at)}</span>
                  <DeleteSnapshotButton snapshotId={s.id} playerId={id} date={formatDate(s.recorded_at)} />
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                  {s.weight_kg && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Peso</span>
                      <span className="font-medium text-foreground">{s.weight_kg} kg</span>
                    </div>
                  )}
                  {s.height_cm && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Altura</span>
                      <span className="font-medium text-foreground">{s.height_cm} cm</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Resistencia</span>
                    <ScoreBadge value={s.endurance_score} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Velocidad</span>
                    <ScoreBadge value={s.speed_score} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fuerza</span>
                    <ScoreBadge value={s.strength_score} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Técnica</span>
                    <ScoreBadge value={s.technique_score} />
                  </div>
                </div>
                {s.notes && (
                  <p className="mt-3 text-xs text-muted-foreground border-t border-border pt-3">{s.notes}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState
            icon="📊"
            title="Sin snapshots todavía."
            action={{ href: `/players/${id}/snapshots/new`, label: 'Registrar el primero' }}
          />
        )}
      </div>

      {/* Session attendance */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-4">Sesiones</h2>
        {attendance && attendance.length > 0 ? (
          <ul className="space-y-2">
            {attendance.map((a, i) => {
              const s = a.sessions
              if (!s) return null
              return (
                <li key={i}>
                  <Link
                    href={`/sessions/${s.id}`}
                    className="flex items-center justify-between px-5 py-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{s.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {formatShortDate(s.session_date)}
                        {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                      </p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      a.attended ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {a.attended ? 'Asistió' : 'Faltó'}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          <EmptyState icon="📅" title="No ha participado en ninguna sesión todavía." />
        )}
      </div>

      {/* Delete player */}
      <div className="pt-2">
        <DeletePlayerButton id={id} name={player.full_name} />
      </div>

    </main>
  )
}
