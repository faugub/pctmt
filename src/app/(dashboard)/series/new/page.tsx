import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SeriesForm } from '@/components/ui/SeriesForm'
import { createSeries } from '@/app/actions/series'

export default async function NewSeriesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between">
        <Link href="/dashboard" className="font-semibold text-gray-900 tracking-tight hover:opacity-70 transition-opacity">
          pctmt
        </Link>
        <Link href="/calendar" className="text-sm text-gray-500 hover:text-gray-900 transition-colors">
          ← Calendario
        </Link>
      </header>

      <main className="max-w-lg mx-auto px-6 py-10">
        <h1 className="text-2xl font-semibold text-gray-900 mb-1">Nueva serie</h1>
        <p className="text-sm text-gray-500 mb-8">
          Define un horario recurrente. Se generarán las sesiones automáticamente en tu calendario.
        </p>
        <div className="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">
          <SeriesForm action={createSeries} players={players ?? []} submitLabel="Crear serie" />
        </div>
      </main>
    </div>
  )
}
