import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const WEEKDAY_LABELS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

const TYPE_COLOR: Record<string, string> = {
  academy:    'bg-blue-50 border-blue-200 text-blue-700',
  individual: 'bg-purple-50 border-purple-200 text-purple-700',
  pairs:      'bg-amber-50 border-amber-200 text-amber-700',
}

const DEFAULT_COLOR = 'bg-gray-50 border-gray-200 text-gray-700'

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

export default async function CalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>
}) {
  const { week } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const anchorDate = week ? new Date(week + 'T00:00:00Z') : new Date()
  const weekStart = startOfWeek(anchorDate)
  const weekEnd = addDays(weekStart, 6)

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const { data: sessions, error } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type, duration_min, series_id, session_series(start_time, session_type)')
    .gte('session_date', toDateOnly(weekStart))
    .lte('session_date', toDateOnly(weekEnd))
    .order('session_date', { ascending: true })

  if (error) throw new Error(error.message)

  const { data: seriesList } = await supabase
    .from('session_series')
    .select('id, title, session_type')
    .order('title', { ascending: true })

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

  const sessionsByDate = new Map<string, SessionRow[]>()
  for (const s of (sessions ?? []) as unknown as SessionRow[]) {
    const list = sessionsByDate.get(s.session_date) ?? []
    list.push(s)
    sessionsByDate.set(s.session_date, list)
  }

  const prevWeekParam = toDateOnly(addDays(weekStart, -7))
  const nextWeekParam = toDateOnly(addDays(weekStart, 7))
  const todayParam = toDateOnly(new Date())

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Calendario</h1>
            <p className="text-sm text-gray-500 mt-0.5">{formatRange(weekStart, weekEnd)}</p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              href={`/calendar?week=${prevWeekParam}`}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              ‹ Anterior
            </Link>
            <Link
              href={`/calendar?week=${todayParam}`}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              Hoy
            </Link>
            <Link
              href={`/calendar?week=${nextWeekParam}`}
              className="px-3 py-2 text-sm bg-white border border-gray-200 rounded-lg text-gray-600 hover:border-gray-400 transition-colors"
            >
              Siguiente ›
            </Link>
            <Link
              href="/series/new"
              className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              + Nueva serie
            </Link>
          </div>
        </div>

        {/* Weekly grid */}
        <div className="grid grid-cols-7 gap-2 mb-10">
          {days.map((day, i) => {
            const dateKey = toDateOnly(day)
            const isToday = dateKey === todayParam
            const daySessions = sessionsByDate.get(dateKey) ?? []

            return (
              <div key={dateKey} className="flex flex-col">
                <div className={`text-center pb-2 mb-2 border-b ${isToday ? 'border-gray-900' : 'border-gray-200'}`}>
                  <p className="text-xs text-gray-400">{WEEKDAY_LABELS[day.getUTCDay()]}</p>
                  <p className={`text-sm font-semibold ${isToday ? 'text-gray-900' : 'text-gray-600'}`}>
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

        {/* Series list */}
        <div>
          <h2 className="text-base font-semibold text-gray-900 mb-3">Series recurrentes</h2>
          {seriesList && seriesList.length > 0 ? (
            <ul className="space-y-2">
              {seriesList.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/series/${s.id}/edit`}
                    className="flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    <span className="text-gray-300 text-lg">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-center py-12 text-gray-400">
              <p className="text-4xl mb-3">📅</p>
              <p className="text-sm">No tienes series recurrentes todavía.</p>
              <Link href="/series/new" className="text-sm text-gray-900 underline mt-2 inline-block">
                Crea la primera
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
