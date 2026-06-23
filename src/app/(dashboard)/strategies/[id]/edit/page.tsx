import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { StrategyForm } from '@/components/ui/StrategyForm'
import { updateStrategy } from '@/app/actions/strategies'

export default async function EditStrategyPage({ params }: { params: Promise<{ id: string }> }) {
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

  const updateAction = updateStrategy.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/strategies/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {strategy.title}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar estrategia</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <StrategyForm
          action={updateAction}
          defaultValues={{
            title: strategy.title,
            court_zone: strategy.court_zone,
            description: strategy.description,
            tags: strategy.tags as string[],
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  )
}
