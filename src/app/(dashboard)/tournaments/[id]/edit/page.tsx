import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TournamentForm } from '@/components/ui/TournamentForm'
import { updateTournament } from '@/app/actions/tournaments'

export default async function EditTournamentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !tournament) notFound()

  const updateAction = updateTournament.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/tournaments/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {tournament.name}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar competencia</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <TournamentForm
          action={updateAction}
          defaultValues={{
            name: tournament.name,
            start_date: tournament.start_date,
            end_date: tournament.end_date,
            location: tournament.location,
            category: tournament.category,
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  )
}
