import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const TYPE_LABEL: Record<string, string> = {
  academy: 'Academia',
  individual: 'Individual',
  pairs: 'Parejas',
}

// Same order as the day picker in SeriesForm, so the summary reads left-to-right Mon→Sun.
const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0]
const WEEKDAY_LABEL: Record<number, string> = {
  1: 'Lun', 2: 'Mar', 3: 'Mié', 4: 'Jue', 5: 'Vie', 6: 'Sáb', 0: 'Dom',
}

function formatDays(days: number[] | null) {
  if (!days || days.length === 0) return '—'
  return WEEKDAY_ORDER.filter((d) => days.includes(d)).map((d) => WEEKDAY_LABEL[d]).join(', ')
}

function formatTime(time: string | null) {
  return time ? time.slice(0, 5) : '—'
}

export default async function SeriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: series, error } = await supabase
    .from('session_series')
    .select('id, title, session_type, recurrence_days, start_time, ends_on')
    .order('title', { ascending: true })

  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Series recurrentes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {series?.length ?? 0} moldes · cada una genera sus sesiones automáticamente
          </p>
        </div>
        <Link
          href="/series/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva serie
        </Link>
      </div>

      {series && series.length > 0 ? (
        <ul className="space-y-2">
          {series.map((s) => (
            <li key={s.id}>
              <Link
                href={`/series/${s.id}/edit`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{s.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDays(s.recurrence_days)} · {formatTime(s.start_time)}
                    {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
                    {s.ends_on ? '' : ' · sin fecha de fin'}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="🔁"
          title="Todavía no hay series recurrentes."
          description="Una serie genera sus sesiones automáticamente según los días que elijas."
          action={{ href: '/series/new', label: 'Crea la primera' }}
        />
      )}
    </main>
  )
}
