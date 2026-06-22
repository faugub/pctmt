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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/tournaments" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Competencias
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Nueva competencia</h1>
        <p className="text-sm text-gray-500 mb-8">Registra dónde compitió tu alumno — vos no organizás esto, solo llevás el seguimiento.</p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <TournamentForm action={createTournament} />
        </div>
      </main>
    </div>
  )
}
