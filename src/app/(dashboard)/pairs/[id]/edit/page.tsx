import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PairForm } from '@/components/ui/PairForm'
import { updatePair } from '@/app/actions/pairs'

export default async function EditPairPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: pair, error } = await supabase
    .from('pairs')
    .select('id, name, notes')
    .eq('id', id)
    .single()

  if (error || !pair) notFound()

  // Players are immutable — changing who's in a pair is semantically a new pair.
  const action = updatePair.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/pairs/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Sociedad
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar sociedad</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <PairForm
          action={action}
          players={[]}
          submitLabel="Guardar cambios"
          editMode
          defaultValues={{ name: pair.name ?? '', notes: pair.notes ?? '' }}
        />
      </div>
    </main>
  )
}
