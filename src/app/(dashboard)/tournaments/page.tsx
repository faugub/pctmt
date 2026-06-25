import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export default async function TournamentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournaments, error } = await supabase
    .from('tournaments')
    .select('id, name, start_date, end_date, location, category')
    .order('start_date', { ascending: false })

  if (error) throw new Error(error.message)

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Competencias</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {tournaments?.length ?? 0} registradas · dónde compitieron tus alumnos y qué lograron
          </p>
        </div>
        <Link
          href="/tournaments/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nueva competencia
        </Link>
      </div>

      {tournaments && tournaments.length > 0 ? (
        <ul className="space-y-2">
          {tournaments.map((t) => (
            <li key={t.id}>
              <Link
                href={`/tournaments/${t.id}`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDate(t.start_date)}
                    {t.end_date && t.end_date !== t.start_date ? ` – ${formatDate(t.end_date)}` : ''}
                    {t.location ? ` · ${t.location}` : ''}
                    {t.category ? ` · ${t.category}` : ''}
                  </p>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="🏆"
          title="Todavía no hay competencias registradas."
          description="No organizas el torneo — solo registras dónde compitió cada alumno y qué logró."
          action={{ href: '/tournaments/new', label: 'Registra la primera' }}
        />
      )}
    </main>
  )
}
