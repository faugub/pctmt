import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SnapshotForm } from '@/components/ui/SnapshotForm'
import { createSnapshot } from '@/app/actions/snapshots'

export default async function NewSnapshotPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: player, error } = await supabase
    .from('players')
    .select('full_name')
    .eq('id', id)
    .eq('coach_id', user.id)
    .single()

  if (error || !player) notFound()

  const action = createSnapshot.bind(null, id)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href={`/players/${id}`} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← {player.full_name}
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Nuevo snapshot</h1>
      <p className="text-sm text-muted-foreground mb-8">{player.full_name}</p>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <SnapshotForm action={action} />
      </div>
    </main>
  )
}
