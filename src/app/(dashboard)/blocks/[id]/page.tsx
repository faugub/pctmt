import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DeleteBlockButton } from '@/components/ui/DeleteBlockButton'

const TYPE_LABEL: Record<string, string> = {
  warmup:    'Calentamiento',
  technique: 'Técnica',
  physical:  'Físico',
  tactical:  'Táctico',
  match:     'Partido',
  cooldown:  'Vuelta a la calma',
}

export default async function BlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: block, error } = await supabase
    .from('training_blocks')
    .select('*, strategies(id, title)')
    .eq('id', id)
    .single()

  if (error || !block) notFound()

  const linkedStrategy = block.strategies as { id: string; title: string } | null

  return (
    <main className="max-w-lg mx-auto px-6 py-10 space-y-8">

      <Link href="/blocks" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Bloques
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-4">
          <h1 className="text-2xl font-semibold text-foreground">{block.title}</h1>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
              {TYPE_LABEL[block.block_type] ?? block.block_type}
            </span>
            {block.duration_min && (
              <span className="px-2 py-0.5 text-xs font-medium bg-muted text-muted-foreground rounded-full">
                {block.duration_min} min
              </span>
            )}
            {block.tags && (block.tags as string[]).map((tag: string) => (
              <span key={tag} className="px-2 py-0.5 bg-blue-50 text-blue-600 rounded-full text-xs">
                {tag}
              </span>
            ))}
          </div>
        </div>
        <Link
          href={`/blocks/${id}/edit`}
          className="px-3 py-1.5 text-sm border border-border rounded-lg text-foreground hover:bg-muted transition-colors flex-shrink-0"
        >
          Editar
        </Link>
      </div>

      {/* Description */}
      {block.description ? (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{block.description}</p>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <p className="text-sm text-muted-foreground italic">Sin descripción.</p>
        </div>
      )}

      {/* Linked strategy */}
      {linkedStrategy && (
        <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
          <p className="text-xs text-muted-foreground mb-1">Vinculado a la estrategia</p>
          <Link href={`/strategies/${linkedStrategy.id}`} className="text-sm font-medium text-foreground hover:underline">
            {linkedStrategy.title} →
          </Link>
        </div>
      )}

      {/* Delete */}
      <div className="pt-2">
        <DeleteBlockButton id={id} title={block.title} />
      </div>

    </main>
  )
}
