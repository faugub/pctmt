import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const LEVEL_LABEL: Record<string, string> = {
  beginner: 'Iniciación',
  intermediate: 'Intermedio',
  advanced: 'Avanzado',
  competition: 'Competición',
}

const HAND_LABEL: Record<string, string> = {
  right: 'Derecha',
  left: 'Izquierda',
}

export default async function PlayersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: players, error } = await supabase
    .from('players')
    .select('id, full_name, level, dominant_hand, birth_date')
    .order('full_name', { ascending: true })

  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Jugadores</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{players?.length ?? 0} registrados</p>
        </div>
        <Link
          href="/players/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo jugador
        </Link>
      </div>

      {players && players.length > 0 ? (
        <ul className="space-y-2">
          {players.map((p) => (
            <li key={p.id}>
              <Link
                href={`/players/${p.id}`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{p.full_name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {p.level ? LEVEL_LABEL[p.level] ?? p.level : '—'}
                    {p.dominant_hand ? ` · ${HAND_LABEL[p.dominant_hand] ?? p.dominant_hand}` : ''}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
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
