import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Dashboard
        </Link>
      </header>

      <main className="max-w-3xl mx-auto px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Torneos</h1>
            <p className="text-sm text-gray-500 mt-0.5">{tournaments?.length ?? 0} registrados</p>
          </div>
          <Link
            href="/tournaments/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nuevo torneo
          </Link>
        </div>

        {tournaments && tournaments.length > 0 ? (
          <ul className="space-y-2">
            {tournaments.map((t) => (
              <li key={t.id}>
                <Link
                  href={`/tournaments/${t.id}`}
                  className="flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {formatDate(t.start_date)}
                      {t.end_date && t.end_date !== t.start_date ? ` – ${formatDate(t.end_date)}` : ''}
                      {t.location ? ` · ${t.location}` : ''}
                      {t.category ? ` · ${t.category}` : ''}
                    </p>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🏆</p>
            <p className="text-sm">Todavía no hay torneos.</p>
            <Link href="/tournaments/new" className="text-sm text-gray-900 underline mt-2 inline-block">
              Registra el primero
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
