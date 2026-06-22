import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteStrategyButton } from '@/components/ui/DeleteStrategyButton'

const ZONE_LABEL: Record<string, string> = {
  red:      'Red',
  midcourt: 'Mediocampo',
  back:     'Fondo',
  full:     'Campo completo',
}

export default async function StrategyPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: strategy, error } = await supabase
    .from('strategies')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !strategy) notFound()

  const { data: boards } = await supabase
    .from('tactic_boards')
    .select('id, title')
    .eq('strategy_id', id)
    .order('updated_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/strategies" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Estrategias
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <h1 className="text-2xl font-semibold text-gray-900">{strategy.title}</h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {strategy.court_zone && (
                <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
                  {ZONE_LABEL[strategy.court_zone] ?? strategy.court_zone}
                </span>
              )}
              {strategy.tags && (strategy.tags as string[]).map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <Link
            href={`/strategies/${id}/edit`}
            className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg text-gray-700 hover:border-gray-400 transition-colors flex-shrink-0"
          >
            Editar
          </Link>
        </div>

        {/* Description */}
        {strategy.description ? (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{strategy.description}</p>
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl shadow-sm px-6 py-5">
            <p className="text-sm text-gray-400 italic">Sin descripción.</p>
          </div>
        )}

        {/* Tactic boards linked to this strategy */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-semibold text-gray-900">Pizarras tácticas</h2>
            <Link
              href={`/boards/new?strategy_id=${id}`}
              className="text-xs text-gray-500 hover:text-gray-900 transition-colors"
            >
              + Nueva pizarra
            </Link>
          </div>

          {boards && boards.length > 0 ? (
            <ul className="space-y-2">
              {boards.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/boards/${b.id}`}
                    className="flex items-center justify-between px-5 py-3 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-medium text-gray-900">{b.title}</p>
                    <span className="text-gray-300 text-lg">›</span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <Link
              href={`/boards/new?strategy_id=${id}`}
              className="block text-center py-6 text-sm text-gray-400 bg-white border border-gray-100 rounded-2xl hover:border-gray-300 transition-colors"
            >
              Dibuja la jugada en una pizarra táctica →
            </Link>
          )}
        </div>

        {/* Delete */}
        <div className="pt-2">
          <DeleteStrategyButton id={id} title={strategy.title} />
        </div>

      </main>
    </div>
  )
}
