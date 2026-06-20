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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href={`/blocks/${id}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← {block.title}
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Editar bloque</h1>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
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
    </div>
  )
}
