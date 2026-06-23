import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PlayerForm } from '@/components/ui/PlayerForm'
import { updatePlayer } from '@/app/actions/players'

export default async function EditPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !player) notFound()

  const updateAction = updatePlayer.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/players/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {player.full_name}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-8">Editar jugador</h1>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <PlayerForm
          action={updateAction}
          defaultValues={{
            full_name: player.full_name,
            birth_date: player.birth_date,
            dominant_hand: player.dominant_hand,
            level: player.level,
            weight_kg: player.weight_kg,
            height_cm: player.height_cm,
          }}
          submitLabel="Guardar cambios"
        />
      </div>
    </main>
  )
}
