import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { SeriesForm } from '@/components/ui/SeriesForm'
import { updateSeries } from '@/app/actions/series'
import { DeleteSeriesButton } from '@/components/ui/DeleteSeriesButton'

export default async function EditSeriesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: series, error } = await supabase
    .from('session_series')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !series) notFound()

  const { data: players } = await supabase
    .from('players')
    .select('id, full_name')
    .order('full_name', { ascending: true })

  // Default submit applies to the whole series (past + future regenerated).
  // The extra actions below give the coach a way to scope it to just future
  // occurrences, or to leave existing sessions untouched entirely.
  const updateAllAction = updateSeries.bind(null, id, 'all', null)
  const updateFutureAction = updateSeries.bind(null, id, 'future', 0)
  const updateThisAction = updateSeries.bind(null, id, 'this', null)

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/calendar" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Calendario
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Editar serie</h1>
      <p className="text-sm text-muted-foreground mb-6">{series.title}</p>

      <div className="bg-amber-50 border border-amber-100 rounded-2xl px-5 py-4 mb-6">
        <p className="text-xs text-amber-800">
          Al guardar puedes elegir el alcance: toda la serie regenera las sesiones existentes
          (se pierde la asistencia ya marcada), solo futuras conserva el pasado, y la última
          opción solo cambia el molde para sesiones nuevas.
        </p>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm p-6 mb-6">
        <SeriesForm
          action={updateAllAction}
          players={players ?? []}
          showStartsOn={false}
          defaultValues={{
            title: series.title,
            session_type: series.session_type,
            category: series.category,
            level: series.level,
            recurrence_days: series.recurrence_days,
            start_time: series.start_time,
            duration_min: series.duration_min,
            ends_on: series.ends_on,
            player_ids: series.player_ids,
            notes: series.notes,
          }}
          submitLabel="Guardar — toda la serie"
          extraActions={[
            { label: 'Guardar — solo sesiones futuras', action: updateFutureAction },
            { label: 'Guardar — solo el molde (no toca sesiones existentes)', action: updateThisAction },
          ]}
        />
      </div>

      <DeleteSeriesButton id={id} title={series.title} />
    </main>
  )
}
