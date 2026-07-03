import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { CoachHoursChart } from '@/components/ui/CoachHoursChart'

// ── Types ────────────────────────────────────────────────────────────────────

type WeekSession = {
  id: string
  title: string
  session_date: string
  duration_min: number | null
  session_type: string | null
  session_players: { player_id: string }[]
}

type PlayerWithSnapshots = {
  id: string
  full_name: string
  player_snapshots: { recorded_at: string }[]
}

type ActivePlan = {
  id: string
  title: string
  total_sessions: number
  plan_sessions: { status: string }[]
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica', physical: 'Física', tactical: 'Táctica',
  match: 'Partido', mixed: 'Mixta',
}

function toDateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

function weekRange(): { monday: string; sunday: string } {
  const now = new Date()
  const day = now.getUTCDay() // 0 = Sun
  const mondayOffset = day === 0 ? -6 : 1 - day
  const monday = new Date(Date.UTC(
    now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + mondayOffset,
  ))
  const sunday = new Date(monday.getTime() + 6 * 24 * 60 * 60 * 1000)
  return { monday: toDateOnly(monday), sunday: toDateOnly(sunday) }
}

function daysSince(dateStr: string): number {
  const today = new Date().toISOString().split('T')[0]
  return Math.round(
    (new Date(today + 'T00:00:00Z').getTime() - new Date(dateStr + 'T00:00:00Z').getTime())
    / (24 * 60 * 60 * 1000),
  )
}

function formatWeekDay(dateStr: string): string {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', timeZone: 'UTC',
  })
}

function formatFullDate(): string {
  return new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
  })
}

function monthLabel(d: Date): string {
  const l = d.toLocaleDateString('es-ES', { month: 'short' })
  return l.charAt(0).toUpperCase() + l.slice(1).replace('.', '')
}

function monthKey(d: Date): string {
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = toDateOnly(new Date())
  const { monday, sunday } = weekRange()
  const cutoff30 = toDateOnly(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000))

  const { data: coach } = await supabase
    .from('coaches').select('full_name, plan').eq('id', user.id).single()

  const firstName = coach?.full_name?.split(' ')[0] ?? 'entrenador'

  // ── 5 parallel queries ────────────────────────────────────────────────────
  const [
    weekRes,
    playersRes,
    planRes,
    compRes,
    hoursRes,
  ] = await Promise.all([
    supabase
      .from('sessions')
      .select('id, title, session_date, duration_min, session_type, session_players(player_id)')
      .gte('session_date', monday)
      .lte('session_date', sunday)
      .order('session_date', { ascending: true }),

    supabase
      .from('players')
      .select('id, full_name, player_snapshots(recorded_at)')
      .order('full_name', { ascending: true }),

    supabase
      .from('training_plans')
      .select('id, title, total_sessions, plan_sessions(status)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('tournaments')
      .select('id, name, start_date, location')
      .gte('start_date', today)
      .order('start_date', { ascending: true })
      .limit(1)
      .maybeSingle(),

    supabase
      .from('sessions')
      .select('session_date, duration_min')
      .gte('session_date', toDateOnly(
        new Date(Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 5, 1)),
      )),
  ])

  // ── Process: today vs rest of week ────────────────────────────────────────
  const weekSessions = (weekRes.data ?? []) as WeekSession[]
  const todaySessions  = weekSessions.filter(s => s.session_date === today)
  const restOfWeek     = weekSessions.filter(s => s.session_date > today)

  // ── Process: players needing evaluation ───────────────────────────────────
  const allPlayers = (playersRes.data ?? []) as PlayerWithSnapshots[]
  const playersToEval = allPlayers
    .map(p => {
      const sorted = [...(p.player_snapshots ?? [])]
        .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
      const lastSnapshot = sorted[0]?.recorded_at ?? null
      return { id: p.id, full_name: p.full_name, lastSnapshot }
    })
    .filter(p => !p.lastSnapshot || p.lastSnapshot < cutoff30)
    .sort((a, b) => {
      if (!a.lastSnapshot) return -1
      if (!b.lastSnapshot) return 1
      return a.lastSnapshot.localeCompare(b.lastSnapshot)
    })
    .slice(0, 5)

  // ── Process: active plan progress ─────────────────────────────────────────
  const activePlan   = planRes.data as ActivePlan | null
  const doneSessions = activePlan?.plan_sessions?.filter(ps => ps.status === 'done').length ?? 0
  const progressPct  = activePlan
    ? Math.round((doneSessions / Math.max(activePlan.total_sessions, 1)) * 100)
    : 0

  // ── Process: hours chart ──────────────────────────────────────────────────
  const now = new Date()
  const minutesByMonth = new Map<string, number>()
  for (const s of hoursRes.data ?? []) {
    const d   = new Date(s.session_date + 'T00:00:00Z')
    const key = monthKey(d)
    minutesByMonth.set(key, (minutesByMonth.get(key) ?? 0) + (s.duration_min ?? 0))
  }
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (5 - i), 1))
    return { key: monthKey(d), label: monthLabel(d) }
  })
  const hoursData = months.map(m => ({
    month: m.label,
    hours: Math.round(((minutesByMonth.get(m.key) ?? 0) / 60) * 10) / 10,
  }))
  const currentMonthHours  = hoursData[hoursData.length - 1]?.hours ?? 0
  const previousMonthHours = hoursData[hoursData.length - 2]?.hours ?? 0
  const deltaPct = previousMonthHours > 0
    ? Math.round(((currentMonthHours - previousMonthHours) / previousMonthHours) * 100)
    : null
  const hasAnyHours = hoursData.some(m => m.hours > 0)

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-7">

      {/* ── Greeting ── */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Hola, {firstName} 👋</h1>
        <p className="text-sm text-muted-foreground mt-0.5 capitalize">{formatFullDate()}</p>
      </div>

      {/* ── HOY ── */}
      <section>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Hoy</p>
        {todaySessions.length > 0 ? (
          <div className="space-y-3">
            {todaySessions.map(s => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="block bg-primary text-primary-foreground rounded-2xl px-6 py-5 shadow-md hover:opacity-90 transition-opacity"
              >
                <p className="font-semibold text-lg leading-tight">{s.title}</p>
                <p className="text-sm opacity-80 mt-1">
                  {s.duration_min ? `${s.duration_min} min` : null}
                  {s.session_players?.length > 0
                    ? `${s.duration_min ? ' · ' : ''}${s.session_players.length} jugador${s.session_players.length !== 1 ? 'es' : ''}`
                    : null}
                  {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : null}
                </p>
                <p className="text-sm font-medium mt-4 opacity-90">Abrir sesión →</p>
              </Link>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl">
            <p className="text-sm text-muted-foreground">Sin clases hoy</p>
            <Link href="/sessions/new" className="text-sm font-medium text-primary hover:opacity-70 transition-opacity">
              + Nueva sesión
            </Link>
          </div>
        )}
      </section>

      {/* ── ESTA SEMANA ── */}
      {restOfWeek.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Esta semana</p>
          <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
            {restOfWeek.map(s => (
              <Link
                key={s.id}
                href={`/sessions/${s.id}`}
                className="flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatWeekDay(s.session_date)}
                    {s.session_players?.length > 0 ? ` · ${s.session_players.length} jugadores` : ''}
                    {s.duration_min ? ` · ${s.duration_min} min` : ''}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── A EVALUAR ── */}
      {playersToEval.length > 0 && (
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">A evaluar</p>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl overflow-hidden dark:bg-amber-950/20 dark:border-amber-800">
            <div className="divide-y divide-amber-100 dark:divide-amber-900">
              {playersToEval.map(p => (
                <Link
                  key={p.id}
                  href={`/players/${p.id}`}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-amber-100/60 dark:hover:bg-amber-900/20 transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                      {p.lastSnapshot
                        ? `Sin evaluación hace ${daysSince(p.lastSnapshot)} días`
                        : 'Sin evaluaciones aún'}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Evaluar →</span>
                </Link>
              ))}
            </div>
            {allPlayers.length > playersToEval.length && (
              <Link
                href="/players"
                className="block text-center py-2.5 text-xs font-medium text-amber-700 dark:text-amber-400 border-t border-amber-100 dark:border-amber-900 hover:bg-amber-100/50 transition-colors"
              >
                Ver todos los jugadores →
              </Link>
            )}
          </div>
        </section>
      )}

      {/* ── PLAN ACTIVO ── */}
      {activePlan && (
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Plan activo</p>
          <Link
            href={`/plans/${activePlan.id}`}
            className="block bg-card border border-border rounded-2xl px-6 py-5 hover:shadow-md transition-shadow"
          >
            <p className="text-sm font-semibold text-foreground">{activePlan.title}</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {doneSessions} de {activePlan.total_sessions} sesiones completadas
            </p>
            <div className="mt-3 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1.5 text-right">{progressPct}%</p>
          </Link>
        </section>
      )}

      {/* ── ACCESO RÁPIDO ── */}
      <section>
        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/sessions/new"
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            + Nueva sesión
          </Link>
          <Link
            href="/players/new"
            className="flex items-center justify-center gap-1.5 px-4 py-3.5 bg-card border border-border rounded-xl text-sm font-semibold text-foreground hover:bg-muted transition-colors"
          >
            + Jugador
          </Link>
        </div>
      </section>

      {/* ── PRÓXIMA COMPETENCIA ── */}
      {compRes.data && (
        <section>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Próxima competencia</p>
          <Link
            href={`/tournaments/${compRes.data.id}`}
            className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl hover:shadow-md transition-shadow"
          >
            <div>
              <p className="text-sm font-medium text-foreground">{compRes.data.name}</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(compRes.data.start_date + 'T12:00:00Z').toLocaleDateString('es-ES', {
                  weekday: 'short', day: 'numeric', month: 'long', timeZone: 'UTC',
                })}
                {compRes.data.location ? ` · ${compRes.data.location}` : ''}
              </p>
            </div>
            <span className="text-muted-foreground text-lg">›</span>
          </Link>
        </section>
      )}

      {/* ── HORAS DE COACHING (secundario) ── */}
      {hasAnyHours && (
        <section>
          <div className="bg-card border border-border rounded-2xl px-6 py-5">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-semibold text-foreground">Horas de coaching</h2>
              <span className="text-xs text-muted-foreground">Últimos 6 meses</span>
            </div>
            <div className="flex items-baseline gap-2 mb-3">
              <span className="text-2xl font-bold text-foreground">{currentMonthHours}h</span>
              <span className="text-xs text-muted-foreground">este mes</span>
              {deltaPct !== null && (
                <span className={`text-xs font-semibold ${
                  deltaPct >= 0 ? 'text-green-600' : 'text-red-500'
                }`}>
                  {deltaPct >= 0 ? '+' : ''}{deltaPct}% vs mes pasado
                </span>
              )}
            </div>
            <CoachHoursChart data={hoursData} />
          </div>
        </section>
      )}

    </main>
  )
}
