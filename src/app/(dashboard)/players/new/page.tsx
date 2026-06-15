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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/players" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Jugadores
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-8">Nuevo jugador</h1>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <PlayerForm action={createPlayer} submitLabel="Crear jugador" />
        </div>
      </main>
    </div>
  )
}
