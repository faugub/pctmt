import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const ZONE_LABEL: Record<string, string> = {
  red:      'Red',
  midcourt: 'Mediocampo',
  back:     'Fondo',
  full:     'Campo completo',
}

const ZONE_ORDER = ['red', 'midcourt', 'back', 'full']

export default async function StrategiesPage({
  searchParams,
}: {
  searchParams: Promise<{ zone?: string }>
}) {
  const { zone } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('strategies')
    .select('id, title, court_zone, tags')
    .order('created_at', { ascending: false })

  if (zone) query = query.eq('court_zone', zone)

  const { data: strategies, error } = await query
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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Estrategias</h1>
            <p className="text-sm text-gray-500 mt-0.5">{strategies?.length ?? 0} en la biblioteca</p>
          </div>
          <Link
            href="/strategies/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nueva
          </Link>
        </div>

        {/* Zone filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Link
            href="/strategies"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !zone ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Todas
          </Link>
          {ZONE_ORDER.map((z) => (
            <Link
              key={z}
              href={`/strategies?zone=${z}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                zone === z ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {ZONE_LABEL[z]}
            </Link>
          ))}
        </div>

        {strategies && strategies.length > 0 ? (
          <ul className="space-y-2">
            {strategies.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/strategies/${s.id}`}
                  className="flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{s.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      {s.court_zone && (
                        <span className="text-xs text-gray-400">{ZONE_LABEL[s.court_zone] ?? s.court_zone}</span>
                      )}
                      {s.tags && s.tags.length > 0 && (
                        <>
                          {s.court_zone && <span className="text-gray-200">·</span>}
                          {(s.tags as string[]).map((tag) => (
                            <span key={tag} className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-full text-xs">
                              {tag}
                            </span>
                          ))}
                        </>
                      )}
                    </div>
                  </div>
                  <span className="text-gray-300 text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-20 text-gray-400">
            <p className="text-4xl mb-4">🧠</p>
            <p className="text-sm">{zone ? `No hay estrategias en ${ZONE_LABEL[zone] ?? zone}.` : 'La biblioteca está vacía.'}</p>
            <Link href="/strategies/new" className="text-sm text-gray-900 underline mt-2 inline-block">
              Añade la primera
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
