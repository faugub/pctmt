import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

type PairRow = {
  id: string
  name: string | null
  player1_id: string
  player2_id: string
}

export default async function PairsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: rawPairs } = await supabase
    .from('pairs')
    .select('id, name, player1_id, player2_id')
    .order('created_at', { ascending: false }) as { data: PairRow[] | null }

  const pairs = rawPairs ?? []

  // Resolve all player names in one batched query
  const allIds = Array.from(new Set(pairs.flatMap(p => [p.player1_id, p.player2_id])))
  let playerMap = new Map<string, string>()
  if (allIds.length > 0) {
    const { data: playerList } = await supabase
      .from('players')
      .select('id, full_name')
      .in('id', allIds)
    playerMap = new Map(playerList?.map(p => [p.id, p.full_name as string]) ?? [])
  }

  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Sociedades</h1>
        <Link
          href="/pairs/new"
          className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva
        </Link>
      </div>

      {pairs.length === 0 ? (
        <EmptyState
          icon="🤝"
          title="Sin sociedades todavía."
          action={{ href: '/pairs/new', label: 'Crear la primera' }}
        />
      ) : (
        <ul className="space-y-2">
          {pairs.map(p => {
            const p1 = playerMap.get(p.player1_id) ?? 'Jugador'
            const p2 = playerMap.get(p.player2_id) ?? 'Jugador'
            const label = p.name ?? `${p1} / ${p2}`
            return (
              <li key={p.id}>
                <Link
                  href={`/pairs/${p.id}`}
                  className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-foreground">{label}</p>
                    {p.name && (
                      <p className="text-xs text-muted-foreground mt-0.5">{p1} · {p2}</p>
                    )}
                  </div>
                  <span className="text-muted-foreground">→</span>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
