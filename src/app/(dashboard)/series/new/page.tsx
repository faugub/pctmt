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
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Calendario
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Nueva serie</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Define un horario recurrente. Se generarán las sesiones automáticamente en tu calendario.
      </p>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <SeriesForm action={createSeries} players={players ?? []} submitLabel="Crear serie" />
      </div>
    </main>
  )
}
