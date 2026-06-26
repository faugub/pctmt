import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const MIN_QUERY_LENGTH = 2
const RESULTS_PER_TYPE = 8

type Result = {
  id: string
  title: string
  subtitle?: string
  href: string
}

type ResultGroup = {
  label: string
  icon: string
  results: Result[]
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const query = (q ?? '').trim()

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let groups: ResultGroup[] = []

  if (query.length >= MIN_QUERY_LENGTH) {
    const like = `%${query}%`

    const [players, sessions, series, strategies, blocks, plans, boards, tournaments] = await Promise.all([
      supabase.from('players').select('id, full_name, level').ilike('full_name', like).limit(RESULTS_PER_TYPE),
      supabase.from('sessions').select('id, title, session_date').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('session_series').select('id, title, session_type').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('strategies').select('id, title, court_zone').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('training_blocks').select('id, title, block_type').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('training_plans').select('id, title, status').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('tactic_boards').select('id, title, updated_at').ilike('title', like).limit(RESULTS_PER_TYPE),
      supabase.from('tournaments').select('id, name, start_date').ilike('name', like).limit(RESULTS_PER_TYPE),
    ])

    groups = [
      {
        label: 'Jugadores',
        icon: '🎾',
        results: (players.data ?? []).map((p) => ({
          id: p.id, title: p.full_name, subtitle: p.level ?? undefined, href: `/players/${p.id}`,
        })),
      },
      {
        label: 'Sesiones',
        icon: '📋',
        results: (sessions.data ?? []).map((s) => ({
          id: s.id, title: s.title, subtitle: formatDate(s.session_date), href: `/sessions/${s.id}`,
        })),
      },
      {
        label: 'Series',
        icon: '🔁',
        results: (series.data ?? []).map((s) => ({
          id: s.id, title: s.title, subtitle: s.session_type ?? undefined, href: `/series/${s.id}/edit`,
        })),
      },
      {
        label: 'Estrategias',
        icon: '🧠',
        results: (strategies.data ?? []).map((s) => ({
          id: s.id, title: s.title, subtitle: s.court_zone ?? undefined, href: `/strategies/${s.id}`,
        })),
      },
      {
        label: 'Bloques',
        icon: '🏃',
        results: (blocks.data ?? []).map((b) => ({
          id: b.id, title: b.title, subtitle: b.block_type ?? undefined, href: `/blocks/${b.id}`,
        })),
      },
      {
        label: 'Planes',
        icon: '🗺️',
        results: (plans.data ?? []).map((p) => ({
          id: p.id, title: p.title, subtitle: p.status ?? undefined, href: `/plans/${p.id}`,
        })),
      },
      {
        label: 'Pizarras',
        icon: '🖊️',
        results: (boards.data ?? []).map((b) => ({
          id: b.id, title: b.title, subtitle: `Editada ${formatDate(b.updated_at)}`, href: `/boards/${b.id}`,
        })),
      },
      {
        label: 'Competencias',
        icon: '🏆',
        results: (tournaments.data ?? []).map((t) => ({
          id: t.id, title: t.name, subtitle: formatDate(t.start_date), href: `/tournaments/${t.id}`,
        })),
      },
    ].filter((g) => g.results.length > 0)
  }

  const totalResults = groups.reduce((sum, g) => sum + g.results.length, 0)

  return (
    <main className="max-w-2xl mx-auto px-6 py-10">
      <h1 className="text-2xl font-semibold text-foreground mb-6">Buscar</h1>

      {/* Plain GET form — works without JS, one request, friendly to bad connections on the court. */}
      <form method="GET" className="mb-8">
        <input
          type="search"
          name="q"
          defaultValue={query}
          autoFocus
          placeholder="Buscar jugadores, sesiones, estrategias..."
          className="w-full px-4 py-3 border border-border rounded-xl text-base bg-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </form>

      {query.length > 0 && query.length < MIN_QUERY_LENGTH && (
        <p className="text-sm text-muted-foreground">Escribe al menos {MIN_QUERY_LENGTH} letras.</p>
      )}

      {query.length >= MIN_QUERY_LENGTH && totalResults === 0 && (
        <p className="text-sm text-muted-foreground">Sin resultados para &quot;{query}&quot;.</p>
      )}

      {groups.length > 0 && (
        <div className="space-y-6">
          {groups.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 px-1">
                {group.icon} {group.label}
              </p>
              <ul className="space-y-2">
                {group.results.map((r) => (
                  <li key={r.id}>
                    <Link
                      href={r.href}
                      className="flex items-center justify-between px-5 py-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{r.title}</p>
                        {r.subtitle && <p className="text-xs text-muted-foreground mt-0.5">{r.subtitle}</p>}
                      </div>
                      <span className="text-muted-foreground text-lg">›</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </main>
  )
}
