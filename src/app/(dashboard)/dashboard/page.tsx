import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { ProgressChart } from '@/components/ui/ProgressChart'

const TYPE_LABEL: Record<string, string> = {
  technical: 'T\u00e9cnica',
  physical:  'F\u00edsica',
  tactical:  'T\u00e1ctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short',
  })
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coach } = await supabase
    .from('coaches').select('full_name, plan').eq('id', user.id).single()

  const displayName = coach?.full_name ?? user.email

  // Counts
  const [playerCount, sessionCount, tournamentCount, strategyCount] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('tournaments').select('id', { count: 'exact', head: true }),
    supabase.from('strategies').select('id', { count: 'exact', head: true }),
  ])

  // Recent sessions (last 3)
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type')
    .order('session_date', { ascending: false })
    .limit(3)

  // Upcoming tournaments (start_date >= today)
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingTournaments } = await supabase
    .from('tournaments')
    .select('id, name, start_date, location')
    .gte('start_date', today)
    .order('start_date', { ascending: true })
    .limit(3)

  // Progress chart: player with most recent snapshot
  const { data: latestSnapshot } = await supabase
    .from('player_snapshots')
    .select('player_id, players(full_name)')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single()

  type SnapshotRow = {
    recorded_at: string
    endurance_score: number | null
    speed_score: number | null
    strength_score: number | null
    technique_score: number | null
  }

  let chartSnapshots: SnapshotRow[] = []
  let chartPlayerName = ''

  if (latestSnapshot?.player_id) {
    const player = latestSnapshot.players as { full_name: string } | null
    chartPlayerName = player?.full_name ?? ''

    const { data: snaps } = await supabase
      .from('player_snapshots')
      .select('recorded_at, endurance_score, speed_score, strength_score, technique_score')
      .eq('player_id', latestSnapshot.player_id)
      .order('recorded_at', { ascending: true }) as { data: SnapshotRow[] | null }

    chartSnapshots = snaps ?? []
  }

  const stats = [
    { label: 'Jugadores',   value: playerCount.count ?? 0,     href: '/players',     emoji: '\ud83c\udfbe' },
    { label: 'Sesiones',    value: sessionCount.count ?? 0,    href: '/sessions',    emoji: '\ud83d\udccb' },
    { label: 'Torneos',     value: tournamentCount.count ?? 0, href: '/tournaments', emoji: '\ud83c\udfc6' },
    { label: 'Estrategias', value: strategyCount.count ?? 0,   href: '/strategies',  emoji: '\ud83e\udde0' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <span className="font-semibold text-gray-900 tracking-tight">pctmt</span>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500">{displayName}</span>
          <form action={logout}>
            <button type="submit" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
              Salir
            </button>
          </form>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10 space-y-10">

        {/* Greeting */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Hola, {displayName} \ud83d\udc4b</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan: <span className="font-medium text-gray-700 capitalize">{coach?.plan ?? 'free'}</span>
          </p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {stats.map(({ label, value, href, emoji }) => (
            <Link
              key={href}
              href={href}
              className="flex flex-col items-center justify-center gap-1 p-6 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow text-center"
            >
              <span className="text-3xl">{emoji}</span>
              <span className="text-2xl font-bold text-gray-900">{value}</span>
              <span className="text-xs text-gray-500">{label}</span>
            </Link>
          ))}
        </div>

        {/* Progress chart */}
        {chartSnapshots.length >= 2 && (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Progreso de jugadores</h2>
            <ProgressChart snapshots={chartSnapshots} playerName={chartPlayerName} />
          </div>
        )}

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          {/* Recent sessions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">\u00daltimas sesiones</h2>
              <Link href="/sessions" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Ver todas</Link>
            </div>
            {recentSessions && recentSessions.length > 0 ? (
              <ul className="space-y-3">
                {recentSessions.map((s) => (
                  <li key={s.id}>
                    <Link href={`/sessions/${s.id}`} className="flex items-center justify-between hover:opacity-70 transition-opacity">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{s.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(s.session_date)}
                          {s.session_type ? ` \u00b7 ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                        </p>
                      </div>
                      <span className="text-gray-300">\u203a</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Sin sesiones todav\u00eda.</p>
            )}
          </div>

          {/* Upcoming tournaments */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Pr\u00f3ximos torneos</h2>
              <Link href="/tournaments" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Ver todos</Link>
            </div>
            {upcomingTournaments && upcomingTournaments.length > 0 ? (
              <ul className="space-y-3">
                {upcomingTournaments.map((t) => (
                  <li key={t.id}>
                    <Link href={`/tournaments/${t.id}`} className="flex items-center justify-between hover:opacity-70 transition-opacity">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {formatDate(t.start_date)}
                          {t.location ? ` \u00b7 ${t.location}` : ''}
                        </p>
                      </div>
                      <span className="text-gray-300">\u203a</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No hay torneos pr\u00f3ximos.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
