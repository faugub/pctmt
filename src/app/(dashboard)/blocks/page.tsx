import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'

const TYPE_LABEL: Record<string, string> = {
  warmup:    'Calentamiento',
  technique: 'Técnica',
  physical:  'Físico',
  tactical:  'Táctico',
  match:     'Partido',
  cooldown:  'Vuelta a la calma',
}

const TYPE_ORDER = ['warmup', 'technique', 'physical', 'tactical', 'match', 'cooldown']

export default async function BlocksPage({
  searchParams,
}: {
  searchParams: Promise<{ type?: string }>
}) {
  const { type } = await searchParams
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  let query = supabase
    .from('training_blocks')
    .select('id, title, block_type, duration_min, tags')
    .order('created_at', { ascending: false })

  if (type) query = query.eq('block_type', type)

  const { data: blocks, error } = await query
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
            <h1 className="text-2xl font-semibold text-gray-900">Bloques de entrenamiento</h1>
            <p className="text-sm text-gray-500 mt-0.5">{blocks?.length ?? 0} en la biblioteca</p>
          </div>
          <Link
            href="/blocks/new"
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            + Nuevo
          </Link>
        </div>

        {/* Type filter */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <Link
            href="/blocks"
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !type ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            Todos
          </Link>
          {TYPE_ORDER.map((t) => (
            <Link
              key={t}
              href={`/blocks?type=${t}`}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                type === t ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-gray-400'
              }`}
            >
              {TYPE_LABEL[t]}
            </Link>
          ))}
        </div>

        {blocks && blocks.length > 0 ? (
          <ul className="space-y-2">
            {blocks.map((b) => (
              <li key={b.id}>
                <Link
                  href={`/blocks/${b.id}`}
                  className="flex items-center justify-between px-5 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">{b.title}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-xs text-gray-400">{TYPE_LABEL[b.block_type] ?? b.block_type}</span>
                      {b.duration_min && (
                        <>
                          <span className="text-gray-200">·</span>
                          <span className="text-xs text-gray-400">{b.duration_min} min</span>
                        </>
                      )}
                      {b.tags && b.tags.length > 0 && (
                        <>
                          <span className="text-gray-200">·</span>
                          {(b.tags as string[]).map((tag) => (
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
            <p className="text-4xl mb-4">🏃</p>
            <p className="text-sm">{type ? `No hay bloques de tipo ${TYPE_LABEL[type] ?? type}.` : 'La biblioteca está vacía.'}</p>
            <Link href="/blocks/new" className="text-sm text-gray-900 underline mt-2 inline-block">
              Añade el primero
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
