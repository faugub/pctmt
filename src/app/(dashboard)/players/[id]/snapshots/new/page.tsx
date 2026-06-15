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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href={`/players/${id}`} className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← {player.full_name}
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Nuevo snapshot</h1>
        <p className="text-sm text-gray-500 mb-8">{player.full_name}</p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <SnapshotForm action={action} />
        </div>
      </main>
    </div>
  )
}
