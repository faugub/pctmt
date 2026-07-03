import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PairForm } from '@/components/ui/PairForm'
import { createPair } from '@/app/actions/pairs'

export default async function NewPairPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  const hasEnoughPlayers = (players ?? []).length >= 2

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/pairs" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Sociedades
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Nueva sociedad</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        {hasEnoughPlayers ? (
          <PairForm action={createPair} players={players ?? []} submitLabel="Crear sociedad" />
        ) : (
          <p className="text-sm text-muted-foreground">
            Necesitás al menos 2 jugadores para crear una sociedad.{' '}
            <Link href="/players/new" className="text-primary underline">
              Crear jugador
            </Link>
          </p>
        )}
      </div>
    </main>
  )
}
