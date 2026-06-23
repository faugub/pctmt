import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { BlockForm } from '@/components/ui/BlockForm'
import { updateBlock } from '@/app/actions/blocks'

export default async function EditBlockPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: block, error } = await supabase
    .from('training_blocks')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !block) notFound()

  const { data: strategies } = await supabase
    .from('strategies')
    .select('id, title')
    .order('title', { ascending: true })

  const updateAction = updateBlock.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/blocks/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {block.title}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar bloque</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <BlockForm
          action={updateAction}
          strategies={strategies ?? []}
          defaultValues={{
            title: block.title,
            block_type: block.block_type,
            description: block.description,
            duration_min: block.duration_min,
            tags: block.tags as string[],
            strategy_id: block.strategy_id,
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  )
}
