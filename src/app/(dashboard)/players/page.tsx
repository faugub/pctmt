import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const LEVEL_LABEL: Record<string, string> = {
  beginner:     'Iniciación',
  intermediate: 'Intermedio',
  advanced:     'Avanzado',
  competition:  'Competición',
}

type PlayerRow = {
  id: string
  full_name: string
  level: string | null
  dominant_hand: string | null
  player_snapshots: { recorded_at: string }[]
}

function daysSince(dateStr: string): number {
  const today = new Date().toISOString().split('T')[0]
  return Math.round(
    (new Date(today + 'T00:00:00Z').getTime() - new Date(dateStr + 'T00:00:00Z').getTime())
    / (24 * 60 * 60 * 1000),
  )
}

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: raw, error } = await supabase
    .from('players')
    .select('id, full_name, level, dominant_hand, player_snapshots(recorded_at)')
    .order('full_name', { ascending: true }) as { data: PlayerRow[] | null; error: unknown }

  if (error) throw new Error('Error cargando jugadores')

  const cutoff30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString().split('T')[0]

  const players = (raw ?? []).map(p => {
    const sorted = [...(p.player_snapshots ?? [])]
      .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
    const lastSnapshot = sorted[0]?.recorded_at ?? null
    const needsEval   = !lastSnapshot || lastSnapshot < cutoff30
    return { ...p, lastSnapshot, needsEval }
  })

  // Players needing eval float to top, rest stay alphabetical
  const sorted = [
    ...players.filter(p => p.needsEval),
    ...players.filter(p => !p.needsEval),
  ]

  return (
    <main className="max-w-lg mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jugadores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{players.length} registrados</p>
        </div>
        <Link
          href="/players/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo
        </Link>
      </div>

      {sorted.length > 0 ? (
        <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
          {sorted.map(p => (
            <Link
              key={p.id}
              href={`/players/${p.id}`}
              className="flex items-center justify-between px-5 py-3.5 hover:bg-muted transition-colors"
            >
              <div className="flex items-center gap-3">
                {p.needsEval && (
                  <span className="text-amber-500 flex-shrink-0" title="Necesita evaluación">⚠️</span>
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.level ? LEVEL_LABEL[p.level] ?? p.level : null}
                    {p.needsEval ? (
                      <span className="text-amber-600 dark:text-amber-400">
                        {p.level ? ' · ' : ''}
                        {p.lastSnapshot
                          ? `Sin eval. hace ${daysSince(p.lastSnapshot)} días`
                          : 'Sin evaluaciones'}
                      </span>
                    ) : (
                      p.lastSnapshot
                        ? `${p.level ? ' · ' : ''}Última eval. hace ${daysSince(p.lastSnapshot)} días`
                        : null
                    )}
                  </p>
                </div>
              </div>
              <span className="text-muted-foreground text-lg">›</span>
            </Link>
          ))}
        </div>
      ) : (
        <EmptyState
          icon="🎾"
          title="Todavía no hay jugadores."
          action={{ href: '/players/new', label: 'Añade el primero' }}
        />
      )}
    </main>
  )
}
