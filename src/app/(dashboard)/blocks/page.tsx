import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

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
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Bloques de entrenamiento</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{blocks?.length ?? 0} en la biblioteca</p>
        </div>
        <Link
          href="/blocks/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo
        </Link>
      </div>

      {/* Type filter */}
      <div className="flex gap-2 mb-8 flex-wrap">
        <Link
          href="/blocks"
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            !type ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
          }`}
        >
          Todos
        </Link>
        {TYPE_ORDER.map((t) => (
          <Link
            key={t}
            href={`/blocks?type=${t}`}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              type === t ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-muted-foreground hover:bg-muted'
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
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{b.title}</p>
                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                    <span className="text-xs text-muted-foreground">{TYPE_LABEL[b.block_type] ?? b.block_type}</span>
                    {b.duration_min && (
                      <>
                        <span className="text-border">·</span>
                        <span className="text-xs text-muted-foreground">{b.duration_min} min</span>
                      </>
                    )}
                    {b.tags && b.tags.length > 0 && (
                      <>
                        <span className="text-border">·</span>
                        {(b.tags as string[]).map((tag) => (
                          <span key={tag} className="px-2 py-0.5 bg-muted text-muted-foreground rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </>
                    )}
                  </div>
                </div>
                <span className="text-muted-foreground text-lg">›</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="🏃"
          title={type ? `No hay bloques de tipo ${TYPE_LABEL[type] ?? type}.` : 'La biblioteca está vacía.'}
          action={{ href: '/blocks/new', label: 'Añade el primero' }}
        />
      )}
    </main>
  )
}
