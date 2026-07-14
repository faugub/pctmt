import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const TYPE_LABEL: Record<string, string> = {
  technical: 'Técnica',
  physical:  'Física',
  tactical:  'Táctica',
  match:     'Partido',
  mixed:     'Mixta',
}

function formatDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-ES', {
    weekday: 'short', day: '2-digit', month: 'short',
  })
}

type SessionRow = {
  id: string
  title: string
  session_date: string
  session_type: string | null
  duration_min: number | null
  session_players: { player_id: string }[]
}

export default async function SessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const today = new Date().toISOString().split('T')[0]

  const { data: raw, error } = await supabase
    .from('sessions')
    .select('id, title, session_date, session_type, duration_min, session_players(player_id)')
    .order('session_date', { ascending: false }) as { data: SessionRow[] | null; error: unknown }

  if (error) throw new Error('Error cargando sesiones')

  const all       = raw ?? []
  const todayList = all.filter(s => s.session_date === today)
  const upcoming  = all.filter(s => s.session_date > today).reverse()
  const past      = all.filter(s => s.session_date < today).slice(0, 30)
  const hasMore   = all.filter(s => s.session_date < today).length > 30
  const isEmpty   = all.length === 0

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sesiones</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{all.length} registradas</p>
        </div>
        <Link
          href="/sessions/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon="📋"
          title="Todavía no hay sesiones."
          action={{ href: '/sessions/new', label: 'Crea la primera' }}
        />
      ) : (
        <div className="space-y-8">

          {/* HOY */}
          {todayList.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Hoy</p>
              <div className="space-y-3">
                {todayList.map(s => (
                  <Link
                    key={s.id}
                    href={`/sessions/${s.id}`}
                    className="block bg-primary text-primary-foreground rounded-2xl px-6 py-5 shadow-md hover:opacity-90 transition-opacity"
                  >
                    <p className="font-semibold text-lg leading-tight">{s.title}</p>
                    <p className="text-sm opacity-80 mt-1">
                      {s.duration_min ? `${s.duration_min} min` : null}
                      {s.session_players.length > 0
                        ? `${s.duration_min ? ' · ' : ''}${s.session_players.length} jugador${s.session_players.length !== 1 ? 'es' : ''}`
                        : null}
                      {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : null}
                    </p>
                    <p className="text-sm font-medium mt-3 opacity-90">Abrir →</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* PRÓXIMAS */}
          {upcoming.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Próximas</p>
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {upcoming.map(s => <SessionCard key={s.id} s={s} />)}
              </div>
            </section>
          )}

          {/* ANTERIORES */}
          {past.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Anteriores</p>
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {past.map(s => <SessionCard key={s.id} s={s} />)}
              </div>
              {hasMore && (
                <p className="text-xs text-muted-foreground text-center mt-3">
                  Solo se muestran las últimas 30 ·{' '}
                  <Link href="/search" className="underline">Buscar más antiguas</Link>
                </p>
              )}
            </section>
          )}
        </div>
      )}
    </main>
  )
}

function SessionCard({ s }: { s: SessionRow }) {
  const TYPE_LABEL: Record<string, string> = {
    technical: 'Técnica', physical: 'Física', tactical: 'Táctica',
    match: 'Partido', mixed: 'Mixta',
  }
  return (
    <Link
      href={`/sessions/${s.id}`}
      className="flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors"
    >
      <div>
        <p className="text-sm font-medium text-foreground">{s.title}</p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {new Date(s.session_date + 'T12:00:00Z').toLocaleDateString('es-ES', {
            weekday: 'short', day: '2-digit', month: 'short', timeZone: 'UTC',
          })}
          {s.session_players.length > 0 ? ` · ${s.session_players.length} jugadores` : ''}
          {s.session_type ? ` · ${TYPE_LABEL[s.session_type] ?? s.session_type}` : ''}
          {s.duration_min ? ` · ${s.duration_min} min` : ''}
        </p>
      </div>
      <span className="text-muted-foreground text-lg">›</span>
    </Link>
  )
}
