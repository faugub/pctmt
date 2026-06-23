import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { addPhase, deletePhase, markPlanSessionSkipped } from '@/app/actions/plans'
import { AddPhaseForm } from '@/components/ui/AddPhaseForm'
import { DeletePlanButton } from '@/components/ui/DeletePlanButton'

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'En pausa',
  cancelled: 'Cancelado',
}

type Phase = {
  id: string
  title: string
  sort_order: number
  session_count: number
  objectives: string | null
  color: string | null
}

type PlanSessionRow = {
  id: string
  session_number: number
  phase_id: string | null
  session_id: string | null
  status: 'planned' | 'done' | 'skipped'
  notes: string | null
}

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plan, error } = await supabase
    .from('training_plans')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !plan) notFound()

  // Resolve the polymorphic target name.
  let targetLabel = ''
  if (plan.target_type === 'group') {
    const { data: series } = await supabase
      .from('session_series')
      .select('title')
      .eq('id', plan.target_id)
      .single()
    targetLabel = series?.title ?? 'Serie eliminada'
  } else {
    const { data: player } = await supabase
      .from('players')
      .select('full_name')
      .eq('id', plan.target_id)
      .single()
    targetLabel = player?.full_name ?? 'Jugador eliminado'
  }

  const { data: phases } = await supabase
    .from('plan_phases')
    .select('*')
    .eq('plan_id', id)
    .order('sort_order', { ascending: true }) as { data: Phase[] | null }

  const { data: planSessions } = await supabase
    .from('plan_sessions')
    .select('*')
    .eq('plan_id', id)
    .order('session_number', { ascending: true }) as { data: PlanSessionRow[] | null }

  const phaseMap = new Map((phases ?? []).map((p) => [p.id, p]))
  const sessions = planSessions ?? []
  const doneCount = sessions.filter((s) => s.status === 'done').length
  const completionPct = sessions.length > 0 ? Math.round((doneCount / sessions.length) * 100) : 0

  const addPhaseAction = addPhase.bind(null, id)

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">

      <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Planes
      </Link>

      {/* Header */}
      <div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">{plan.title}</h1>
            <p className="text-sm text-muted-foreground mt-1">
              {plan.target_type === 'group' ? 'Grupo' : 'Individual'} · {targetLabel}
            </p>
          </div>
          <span className="text-xs font-medium px-2 py-0.5 bg-muted text-muted-foreground rounded-full whitespace-nowrap">
            {STATUS_LABEL[plan.status] ?? plan.status}
          </span>
        </div>
        {plan.goal_description && (
          <p className="text-sm text-gray-600 mt-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            🎯 {plan.goal_description}
          </p>
        )}
      </div>

      {/* Progress bar */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Progreso</p>
          <p className="text-sm text-muted-foreground">{doneCount} de {sessions.length} sesiones</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all" style={{ width: `${completionPct}%` }} />
        </div>
      </div>

      {/* Phases */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">Fases</h2>
          <AddPhaseForm action={addPhaseAction} />
        </div>
        {phases && phases.length > 0 ? (
          <ul className="space-y-2">
            {phases.map((phase) => (
              <li key={phase.id} className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phase.color ?? '#9ca3af' }}
                    />
                    <p className="text-sm font-medium text-foreground">{phase.title}</p>
                    <span className="text-xs text-muted-foreground">· {phase.session_count} sesiones</span>
                  </div>
                  <form action={deletePhase.bind(null, phase.id, id)}>
                    <button type="submit" className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
                      Eliminar
                    </button>
                  </form>
                </div>
                {phase.objectives && (
                  <p className="text-xs text-muted-foreground mt-2">{phase.objectives}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">Sin fases todavía. Puedes trabajar sesión por sesión directamente.</p>
        )}
      </div>

      {/* Sessions timeline */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Sesiones del plan</h2>
        <ul className="space-y-1.5">
          {sessions.map((s) => {
            const phase = s.phase_id ? phaseMap.get(s.phase_id) : null
            return (
              <li
                key={s.id}
                className="flex items-center justify-between px-4 py-3 bg-card border border-border rounded-xl shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-muted-foreground w-6">#{s.session_number}</span>
                  {phase && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phase.color ?? '#9ca3af' }}
                    />
                  )}
                  <div>
                    {s.session_id ? (
                      <Link href={`/sessions/${s.session_id}`} className="text-sm text-foreground hover:underline">
                        {phase ? phase.title : 'Sesión vinculada'}
                      </Link>
                    ) : (
                      <p className="text-sm text-muted-foreground">{phase ? phase.title : 'Sin asignar'}</p>
                    )}
                    {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {s.status === 'planned' && (
                    <form action={markPlanSessionSkipped.bind(null, s.id, id)}>
                      <button type="submit" className="text-xs text-muted-foreground hover:text-amber-600 transition-colors">
                        Saltar
                      </button>
                    </form>
                  )}
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.status === 'done' ? 'bg-green-100 text-green-700'
                    : s.status === 'skipped' ? 'bg-muted text-muted-foreground'
                    : 'bg-blue-50 text-blue-600'
                  }`}>
                    {s.status === 'done' ? 'Hecha' : s.status === 'skipped' ? 'Saltada' : 'Planeada'}
                  </span>
                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Delete plan */}
      <div className="pt-2">
        <DeletePlanButton id={id} title={plan.title} />
      </div>

    </main>
  )
}
