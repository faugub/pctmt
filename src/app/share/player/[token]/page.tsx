import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProgressChart } from '@/components/ui/ProgressChart'

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciación',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  competition: 'Competición',
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: 'short' })
}

type SnapshotRow = {
  recorded_at: string
  endurance_score: number | null
  speed_score: number | null
  strength_score: number | null
  technique_score: number | null
}

type AttendanceRow = {
  attended: boolean
  sessions: { session_date: string } | null
}

type ResultRow = {
  final_round: string | null
  sets_won: number | null
  sets_lost: number | null
  tournaments: { name: string; start_date: string } | null
}

const ROUND_LABEL: Record<string, string> = {
  winner: 'Campeón',
  final: 'Finalista',
  semifinal: 'Semifinal',
  quarterfinal: 'Cuartos de final',
  groups: 'Fase de grupos',
}

export default async function SharedPlayerPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params

  // This page is intentionally public — no auth.getUser() check. Access is
  // gated entirely by the "public: shared player profile" RLS policy on
  // players (share_enabled = true), matched here by share_token.
  const supabase = await createClient()

  const { data: player, error } = await supabase
    .from('players')
    .select('id, full_name, level, share_enabled')
    .eq('share_token', token)
    .eq('share_enabled', true)
    .single()

  if (error || !player) notFound()

  const playerId = player.id

  const { data: realSnapshots } = await supabase
    .from('player_snapshots')
    .select('recorded_at, endurance_score, speed_score, strength_score, technique_score')
    .eq('player_id', playerId)
    .order('recorded_at', { ascending: true }) as { data: SnapshotRow[] | null }

  const { data: attendanceRows } = await supabase
    .from('session_players')
    .select('attended, sessions(session_date)')
    .eq('player_id', playerId) as { data: AttendanceRow[] | null }

  const last30Days = new Date()
  last30Days.setDate(last30Days.getDate() - 30)
  const recentAttendance = (attendanceRows ?? []).filter(
    (a) => a.sessions && new Date(a.sessions.session_date) >= last30Days
  )
  const attendanceRate = recentAttendance.length > 0
    ? Math.round((recentAttendance.filter((a) => a.attended).length / recentAttendance.length) * 100)
    : null

  const { data: results } = await supabase
    .from('tournament_results')
    .select('final_round, sets_won, sets_lost, tournaments(name, start_date)')
    .eq('player_id', playerId)
    .order('tournaments(start_date)', { ascending: false })
    .limit(5) as { data: ResultRow[] | null }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 text-center">
        <span className="font-semibold text-gray-900 tracking-tight">pctmt</span>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-gray-900">{player.full_name}</h1>
          {player.level && (
            <span className="inline-block mt-2 px-3 py-1 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
              {LEVEL_LABEL[player.level] ?? player.level}
            </span>
          )}
        </div>

        {/* Progress chart */}
        {realSnapshots && realSnapshots.length >= 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Progreso</h2>
            <ProgressChart snapshots={realSnapshots} playerName={player.full_name} />
          </div>
        )}

        {/* Attendance rate */}
        {attendanceRate !== null && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5 text-center">
            <p className="text-3xl font-bold text-gray-900">{attendanceRate}%</p>
            <p className="text-xs text-gray-400 mt-1">Asistencia en los últimos 30 días</p>
          </div>
        )}

        {/* Tournament results */}
        {results && results.length > 0 && (
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-3">Torneos recientes</h2>
            <ul className="space-y-2">
              {results.map((r, i) => (
                <li key={i} className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{r.tournaments?.name ?? 'Torneo'}</p>
                      {r.tournaments?.start_date && (
                        <p className="text-xs text-gray-400 mt-0.5">{formatShortDate(r.tournaments.start_date)}</p>
                      )}
                    </div>
                    {r.final_round && (
                      <span className="text-xs font-medium px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full">
                        {ROUND_LABEL[r.final_round] ?? r.final_round}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-center text-xs text-gray-300 pt-4">
          Progreso compartido por tu entrenador · pctmt
        </p>

      </main>
    </div>
  )
}
