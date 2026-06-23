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
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href="/strategies" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Estrategias
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h1 className="text-2xl font-semibold text-foreground">{strategy.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            {strategy.court_zone && (
              <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
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
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          Editar
        </Link>
      </div>

      {/* Description */}
      {strategy.description ? (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{strategy.description}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
        </div>
      )}

      {/* Tactic boards linked to this strategy */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Pizarras tácticas</h2>
          <Link
            href={`/boards/new?strategy_id=${id}`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
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
                  className="flex items-center justify-between px-5 py-3 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                >
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                  <span className="text-muted-foreground text-lg">›</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Link
            href={`/boards/new?strategy_id=${id}`}
            className="block text-center py-6 text-sm text-muted-foreground bg-card border border-border rounded-2xl hover:bg-muted transition-colors"
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
  )
}
