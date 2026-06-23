import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { TournamentForm } from '@/components/ui/TournamentForm'
import { createTournament } from '@/app/actions/tournaments'

export default async function NewTournamentPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/tournaments" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Competencias
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Nueva competencia</h1>
      <p className="text-sm text-muted-foreground mb-8">Registra dónde compitió tu alumno — vos no organizás esto, solo llevás el seguimiento.</p>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <TournamentForm action={createTournament} />
      </div>
    </main>
  )
}
