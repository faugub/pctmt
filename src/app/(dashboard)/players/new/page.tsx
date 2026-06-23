import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PlayerForm } from '@/components/ui/PlayerForm'
import { createPlayer } from '@/app/actions/players'

export default async function NewPlayerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/players" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Jugadores
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Nuevo jugador</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <PlayerForm action={createPlayer} submitLabel="Crear jugador" />
      </div>
    </main>
  )
}
