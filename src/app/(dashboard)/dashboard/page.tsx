import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { logout } from '@/app/actions/auth'
import { CoachHoursChart } from '@/components/ui/CoachHoursChart'

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  physical:  'Física',
  tactical:  'Táctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short',
  })
}

function toDateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

function monthKey(d: Date) {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

function monthLabel(d: Date) {
  const label = d.toLocaleDateString('es-ES', { month: 'short' })
  return label.charAt(0).toUpperCase() + label.slice(1).replace('.', '')
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coach } = await supabase
    .from('coaches').select('full_name, plan').eq('id', user.id).single()

  const displayName = coach?.full_name ?? user.email

  // Counts
  const [playerCount, sessionCount, tournamentCount, strategyCount, blockCount, boardCount] = await Promise.all([
    supabase.from('players').select('id', { count: 'exact', head: true }),
    supabase.from('sessions').select('id', { count: 'exact', head: true }),
    supabase.from('tournaments').select('id', { count: 'exact', head: true }),
    supabase.from('strategies').select('id', { count: 'exact', head: true }),
    supabase.from('training_blocks').select('id', { count: 'exact', head: true }),
    supabase.from('tactic_boards').select('id', { count: 'exact', head: true }),
  ])

  // Recent sessions (last 3)
  const { data: recentSessions } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type')
    .order('session_date', { ascending: false })
    .limit(3)

  // Upcoming competitions (start_date >= today)
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingTournaments } = await supabase
    .from('tournaments')
    .select('id, name, start_date, location')
    .gte('start_date', today)
    .order('start_date', { ascending: true })
    .limit(3)

  // Coach utilization — hours coached per month, last 6 months.
  // This is the metric that actually matters to a coach's income, unlike
  // "progress of whichever player was opened last" which told them nothing.
  const now = new Date()
  const rangeStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1))

  const { data: hourSessions } = await supabase
    .from('sessions')
    .select('session_date, duration_min')
    .gte('session_date', toDateOnly(rangeStart))

  const minutesByMonth = new Map<string, number>()
  for (const s of hourSessions ?? []) {
    const d = new Date(s.session_date + 'T00:00:00Z')
    const key = monthKey(d)
    minutesByMonth.set(key, (minutesByMonth.get(key) ?? 0) + (s.duration_min ?? 0))
  }

  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1))
    return { key: monthKey(d), label: monthLabel(d) }
  })

  const hoursData = months.map((m) => ({
    month: m.label,
    hours: Math.round(((minutesByMonth.get(m.key) ?? 0) / 60) * 10) / 10,
  }))

  const currentMonthHours = hoursData[hoursData.length - 1]?.hours ?? 0
  const previousMonthHours = hoursData[hoursData.length - 2]?.hours ?? 0
  const deltaPct = previousMonthHours > 0
    ? Math.round(((currentMonthHours - previousMonthHours) / previousMonthHours) * 100)
    : null
  const hasAnyHours = hoursData.some((m) => m.hours > 0)

  const stats = [
    { label: 'Jugadores',    value: playerCount.count ?? 0,     href: '/players',     emoji: '🎾' },
    { label: 'Sesiones',     value: sessionCount.count ?? 0,    href: '/sessions',    emoji: '📋' },
    { label: 'Competencias', value: tournamentCount.count ?? 0, href: '/tournaments', emoji: '🏆' },
    { label: 'Estrategias',  value: strategyCount.count ?? 0,   href: '/strategies',  emoji: '🧠' },
    { label: 'Bloques',      value: blockCount.count ?? 0,      href: '/blocks',      emoji: '🏃' },
    { label: 'Pizarras',     value: boardCount.count ?? 0,      href: '/boards',      emoji: '🖊️' },
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
          <h1 className="text-2xl font-semibold text-gray-900">Hola, {displayName} 👋</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Plan: <span className="font-medium text-gray-700 capitalize">{coach?.plan ?? 'free'}</span>
          </p>
        </div>

        {/* Calendar + Plans — primary entry points to the coach's workflow */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/calendar"
            className="flex items-center justify-between px-6 py-5 bg-gray-900 text-white rounded-2xl shadow-sm hover:bg-gray-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">📅</span>
              <div>
                <p className="text-sm font-semibold">Calendario</p>
                <p className="text-xs text-gray-300">Ver la semana, series recurrentes</p>
              </div>
            </div>
            <span className="text-gray-400 text-lg">›</span>
          </Link>
          <Link
            href="/plans"
            className="flex items-center justify-between px-6 py-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-3">
              <span className="text-3xl">🗺️</span>
              <div>
                <p className="text-sm font-semibold text-gray-900">Planes</p>
                <p className="text-xs text-gray-500">Ciclos de sesiones por objetivo</p>
              </div>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
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

        {/* Coach utilization */}
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">Horas de coaching</h2>
            <span className="text-xs text-gray-400">Últimos 6 meses</span>
          </div>

          {hasAnyHours ? (
            <>
              <div className="flex items-baseline gap-2 mb-2 flex-wrap">
                <span className="text-3xl font-bold text-gray-900">{currentMonthHours}h</span>
                <span className="text-sm text-gray-400">este mes</span>
                {deltaPct !== null && (
                  <span className={`text-sm font-medium ${deltaPct >= 0 ? 'text-green-600' : 'text-red-500'}`}>
                    {deltaPct >= 0 ? '+' : ''}{deltaPct}% vs mes pasado
                  </span>
                )}
              </div>
              <CoachHoursChart data={hoursData} />
            </>
          ) : (
            <p className="text-sm text-gray-400 py-8 text-center">
              Aún no registras horas dadas. Se calculan a partir de la duración de tus sesiones.
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

          {/* Recent sessions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Últimas sesiones</h2>
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
                          {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                        </p>
                      </div>
                      <span className="text-gray-300">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">Sin sesiones todavía.</p>
            )}
          </div>

          {/* Upcoming competitions */}
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-5 py-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Próximas competencias</h2>
              <Link href="/tournaments" className="text-xs text-gray-400 hover:text-gray-700 transition-colors">Ver todas</Link>
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
                          {t.location ? ` · ${t.location}` : ''}
                        </p>
                      </div>
                      <span className="text-gray-300">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-400">No hay competencias próximas.</p>
            )}
          </div>

        </div>
      </main>
    </div>
  )
}
