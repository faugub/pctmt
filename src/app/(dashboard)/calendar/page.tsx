import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const TYPE_COLOR: Record<string, string> = {
  academy:    'bg-blue-50 border-blue-200 text-blue-700',
  individual: 'bg-purple-50 border-purple-200 text-purple-700',
  pairs:      'bg-amber-50 border-amber-200 text-amber-700',
}

const DEFAULT_COLOR = 'bg-muted border-border text-muted-foreground'

function toDateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

/** Returns the Monday of the week containing the given date (UTC-safe). */
function startOfWeek(date: Date): Date {
  const d = new Date(date)
  const day = d.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day // shift Sunday to end of week
  d.setUTCDate(d.getUTCDate() + diff)
  return d
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setUTCDate(d.getUTCDate() + days)
  return d
}

function formatRange(start: Date, end: Date): string {
  const fmt = (d: Date) => d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' })
  return `${fmt(start)} – ${fmt(end)}`
}

/** First day of the month containing the given date (UTC-safe). */
function startOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1))
}

/** Last day of the month containing the given date (UTC-safe). */
function endOfMonth(date: Date): Date {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + 1, 0))
}

function formatMonthLabel(date: Date): string {
  const label = date.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })
  return label.charAt(0).toUpperCase() + label.slice(1)
}

type SeriesInfo = { start_time: string; session_type: string } | null
type SessionRow = {
  id: string
  title: string
  session_date: string
  session_type: string | null
  duration_min: number | null
  series_id: string | null
  session_series: SeriesInfo
}

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; week?: string; month?: string }>
}) {
  const { view: viewParam, week, month } = await searchParams
  const view = viewParam === 'month' ? 'month' : 'week'

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const todayParam = toDateOnly(new Date())

  // ---- Range + nav params depend on the active view ----
  let rangeStart: Date
  let rangeEnd: Date
  let prevParam: string
  let nextParam: string
  let todayHref: string
  let headerLabel: string

  if (view === 'month') {
    const anchorDate = month ? new Date(month + 'T00:00:00Z') : new Date()
    const monthStart = startOfMonth(anchorDate)
    const monthEnd = endOfMonth(anchorDate)
    rangeStart = startOfWeek(monthStart)
    rangeEnd = addDays(startOfWeek(monthEnd), 6)

    const prevMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() - 1, 1))
    const nextMonth = new Date(Date.UTC(monthStart.getUTCFullYear(), monthStart.getUTCMonth() + 1, 1))
    prevParam = toDateOnly(prevMonth)
    nextParam = toDateOnly(nextMonth)
    todayHref = `/calendar?view=month&month=${toDateOnly(startOfMonth(new Date()))}`
    headerLabel = formatMonthLabel(monthStart)
  } else {
    const anchorDate = week ? new Date(week + 'T00:00:00Z') : new Date()
    rangeStart = startOfWeek(anchorDate)
    rangeEnd = addDays(rangeStart, 6)
    prevParam = toDateOnly(addDays(rangeStart, -7))
    nextParam = toDateOnly(addDays(rangeStart, 7))
    todayHref = `/calendar?view=week&week=${todayParam}`
    headerLabel = formatRange(rangeStart, rangeEnd)
  }

  const days = Array.from(
    { length: Math.round((rangeEnd.getTime() - rangeStart.getTime()) / 86400000) + 1 },
    (_, i) => addDays(rangeStart, i)
  )

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type, duration_min, series_id, session_series(start_time, session_type)')
    .gte('session_date', toDateOnly(rangeStart))
    .lte('session_date', toDateOnly(rangeEnd))
    .order('session_date', { ascending: true })

  if (error) throw new Error(error.message)

  const { data: seriesList } = await supabase
    .from('session_series')
    .select('id, title, session_type')
    .order('title', { ascending: true })

  const sessionsByDate = new Map<string, SessionRow[]>()
  for (const s of (sessions ?? []) as unknown as SessionRow[]) {
    const list = sessionsByDate.get(s.session_date) ?? []
    list.push(s)
    sessionsByDate.set(s.session_date, list)
  }

  const prevHref = view === 'month' ? `/calendar?view=month&month=${prevParam}` : `/calendar?view=week&week=${prevParam}`
  const nextHref = view === 'month' ? `/calendar?view=month&month=${nextParam}` : `/calendar?view=week&week=${nextParam}`

  const currentMonthIndex = view === 'month'
    ? (month ? new Date(month + 'T00:00:00Z') : new Date()).getUTCMonth()
    : null

  return (
    <main className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Calendario</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{headerLabel}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* View toggle */}
          <div className="flex items-center bg-card border border-border rounded-lg p-0.5">
            <Link
              href={`/calendar?view=week&week=${view === 'week' ? toDateOnly(rangeStart) : todayParam}`}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === 'week' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Semana
            </Link>
            <Link
              href={`/calendar?view=month&month=${view === 'month' ? toDateOnly(startOfMonth(rangeStart)) : toDateOnly(startOfMonth(new Date()))}`}
              className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                view === 'month' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Mes
            </Link>
          </div>

          <Link href={prevHref} className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            ‹ Anterior
          </Link>
          <Link href={todayHref} className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Hoy
          </Link>
          <Link href={nextHref} className="px-3 py-2 text-sm bg-card border border-border rounded-lg text-muted-foreground hover:bg-muted transition-colors">
            Siguiente ›
          </Link>
          <Link href="/series/new" className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
            + Nueva serie
          </Link>
        </div>
      </div>

      {view === 'week' ? (
        /* ---- Weekly grid ---- */
        <div className="grid grid-cols-7 gap-2 mb-10">
          {days.map((day) => {
            const dateKey = toDateOnly(day)
            const isToday = dateKey === todayParam
            const daySessions = sessionsByDate.get(dateKey) ?? []

            return (
              <div key={dateKey} className="flex flex-col">
                <div className={`text-center pb-2 mb-2 border-b ${isToday ? 'border-primary' : 'border-border'}`}>
                  <p className="text-xs text-muted-foreground">{WEEKDAY_LABELS[day.getUTCDay()]}</p>
                  <p className={`text-sm font-semibold ${isToday ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {day.getUTCDate()}
                  </p>
                </div>
                <div className="flex flex-col gap-1.5 min-h-[120px]">
                  {daySessions.map((s) => {
                    const colorType = s.session_series?.session_type
                    const colorClass = (colorType && TYPE_COLOR[colorType]) ?? DEFAULT_COLOR
                    return (
                      <Link
                        key={s.id}
                        href={`/sessions/${s.id}`}
                        className={`px-2 py-1.5 rounded-lg border text-xs leading-tight hover:shadow-sm transition-shadow ${colorClass}`}
                      >
                        {s.session_series?.start_time && (
                          <p className="font-medium">{s.session_series.start_time.slice(0, 5)}</p>
                        )}
                        <p className="truncate">{s.title}</p>
                      </Link>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* ---- Monthly grid ---- */
        <div className="mb-10">
          <div className="grid grid-cols-7 gap-px mb-1">
            {WEEKDAY_LABELS.slice(1).concat(WEEKDAY_LABELS[0]).map((label) => (
              <div key={label} className="text-center text-xs text-muted-foreground pb-2">
                {label}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-px bg-border rounded-xl overflow-hidden border border-border">
            {days.map((day) => {
              const dateKey = toDateOnly(day)
              const isToday = dateKey === todayParam
              const isCurrentMonth = day.getUTCMonth() === currentMonthIndex
              const daySessions = sessionsByDate.get(dateKey) ?? []
              const visibleSessions = daySessions.slice(0, 3)
              const extraCount = daySessions.length - visibleSessions.length

              return (
                <Link
                  key={dateKey}
                  href={`/calendar?view=week&week=${toDateOnly(startOfWeek(day))}`}
                  className={`bg-card min-h-[92px] p-1.5 flex flex-col gap-1 hover:bg-muted transition-colors ${
                    isCurrentMonth ? '' : 'opacity-40'
                  }`}
                >
                  <span
                    className={`text-xs font-medium inline-flex items-center justify-center w-5 h-5 rounded-full ${
                      isToday ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {day.getUTCDate()}
                  </span>
                  <div className="flex flex-col gap-0.5">
                    {visibleSessions.map((s) => {
                      const colorType = s.session_series?.session_type
                      const colorClass = (colorType && TYPE_COLOR[colorType]) ?? DEFAULT_COLOR
                      return (
                        <span
                          key={s.id}
                          className={`px-1.5 py-0.5 rounded border text-[10px] leading-tight truncate ${colorClass}`}
                        >
                          {s.title}
                        </span>
                      )
                    })}
                    {extraCount > 0 && (
                      <span className="text-[10px] text-muted-foreground px-1.5">+{extraCount} más</span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      )}

      {/* Series list */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Series recurrentes</h2>
        {seriesList && seriesList.length > 0 ? (
          <ul className="space-y-2">
            {seriesList.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/series/${s.id}/edit`}
                  className="flex items-center justify-between px-5 py-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <span className="text-muted-foreground text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12 text-muted-foreground">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-sm">No tienes series recurrentes todavía.</p>
            <Link href="/series/new" className="text-sm text-foreground underline mt-2 inline-block">
              Crea la primera
            </Link>
          </div>
        )}
      </div>
    </main>
  )
}
