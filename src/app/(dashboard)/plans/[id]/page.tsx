import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import {
  addPhase,
  deletePhase,
  markPlanSessionSkipped,
  linkSessionToPlanForm,
  unlinkSessionFromPlan,
} from '@/app/actions/plans'
import { AddPhaseForm } from '@/components/ui/AddPhaseForm'
import { DeletePlanButton } from '@/components/ui/DeletePlanButton'

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo', completed: 'Completado', paused: 'En pausa', cancelled: 'Cancelado',
}

function formatShortDate(dateStr: string) {
  return new Date(dateStr + 'T12:00:00Z').toLocaleDateString('es-ES', {
    day: '2-digit', month: 'short', year: '2-digit', timeZone: 'UTC',
  })
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
  sessions: { id: string; title: string; session_date: string } | null
  status: 'planned' | 'done' | 'skipped'
  notes: string | null
}

type SessionOption = {
  id: string
  title: string
  session_date: string
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

  // Resolve polymorphic target
  let targetLabel = ''
  if (plan.target_type === 'group') {
    const { data: series } = await supabase
      .from('session_series').select('title').eq('id', plan.target_id).single()
    targetLabel = series?.title ?? 'Serie eliminada'
  } else {
    const { data: player } = await supabase
      .from('players').select('full_name').eq('id', plan.target_id).single()
    targetLabel = player?.full_name ?? 'Jugador eliminado'
  }

  const [{ data: phases }, { data: planSessions }, { data: allSessions }] = await Promise.all([
    supabase
      .from('plan_phases')
      .select('*')
      .eq('plan_id', id)
      .order('sort_order', { ascending: true }) as Promise<{ data: Phase[] | null }>,

    supabase
      .from('plan_sessions')
      .select('*, sessions(id, title, session_date)')
      .eq('plan_id', id)
      .order('session_number', { ascending: true }) as Promise<{ data: PlanSessionRow[] | null }>,

    supabase
      .from('sessions')
      .select('id, title, session_date')
      .order('session_date', { ascending: false })
      .limit(200) as Promise<{ data: SessionOption[] | null }>,
  ])

  const phaseMap     = new Map((phases ?? []).map(p => [p.id, p]))
  const sessions     = planSessions ?? []
  const doneCount    = sessions.filter(s => s.status === 'done').length
  const completionPct = sessions.length > 0 ? Math.round((doneCount / sessions.length) * 100) : 0

  const addPhaseAction = addPhase.bind(null, id)

  return (
    <main className="max-w-2xl mx-auto px-6 py-8 space-y-8">

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

      {/* Progress */}
      <div className="bg-card border border-border rounded-2xl shadow-sm px-6 py-5">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-foreground">Progreso</p>
          <p className="text-sm text-muted-foreground">{doneCount} de {sessions.length} sesiones · {completionPct}%</p>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div className="h-full bg-primary transition-all duration-500" style={{ width: `${completionPct}%` }} />
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
            {phases.map(phase => (
              <li key={phase.id} className="bg-card border border-border rounded-2xl shadow-sm px-5 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: phase.color ?? '#9ca3af' }} />
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
          <p className="text-sm text-muted-foreground">Sin fases. Podés trabajar sesión por sesión directamente.</p>
        )}
      </div>

      {/* Sessions timeline */}
      <div>
        <h2 className="text-base font-semibold text-foreground mb-3">Sesiones del plan</h2>
        <ul className="space-y-1.5">
          {sessions.map(s => {
            const phase        = s.phase_id ? phaseMap.get(s.phase_id) : null
            const linkAction   = linkSessionToPlanForm.bind(null, s.id, id)
            const unlinkAction = unlinkSessionFromPlan.bind(null, s.id, id)
            const skipAction   = markPlanSessionSkipped.bind(null, s.id, id)

            return (
              <li key={s.id} className="px-4 py-3 bg-card border border-border rounded-xl shadow-sm">
                <div className="flex items-start justify-between gap-2">

                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <span className="text-xs font-medium text-muted-foreground w-6 flex-shrink-0 pt-0.5">
                      #{s.session_number}
                    </span>
                    {phase && (
                      <span className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                        style={{ backgroundColor: phase.color ?? '#9ca3af' }} />
                    )}
                    <div className="flex-1 min-w-0">
                      {s.session_id && s.sessions ? (
                        <>
                          <Link
                            href={`/sessions/${s.session_id}`}
                            className="text-sm font-medium text-foreground hover:underline"
                          >
                            {s.sessions.title}
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {formatShortDate(s.sessions.session_date)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          {phase?.title ?? 'Sin fase asignada'}
                        </p>
                      )}
                      {s.notes && (
                        <p className="text-xs text-muted-foreground mt-0.5">{s.notes}</p>
                      )}
                      {s.status === 'planned' && (
                        <form action={linkAction} className="flex gap-1.5 mt-2">
                          <select
                            name="session_id"
                            required
                            className="flex-1 text-xs border border-border rounded-lg px-2 py-1.5 bg-background text-foreground min-w-0"
                          >
                            <option value="">— sesión real —</option>
                            {(allSessions ?? []).map(sess => (
                              <option key={sess.id} value={sess.id}>
                                {sess.title} · {formatShortDate(sess.session_date)}
                              </option>
                            ))}
                          </select>
                          <button
                            type="submit"
                            className="text-xs px-2.5 py-1.5 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity flex-shrink-0"
                          >
                            Vincular
                          </button>
                        </form>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                      s.status === 'done'      ? 'bg-green-100 text-green-700'
                      : s.status === 'skipped' ? 'bg-muted text-muted-foreground'
                      : 'bg-blue-50 text-blue-600'
                    }`}>
                      {s.status === 'done' ? 'Hecha' : s.status === 'skipped' ? 'Saltada' : 'Planeada'}
                    </span>
                    {s.status === 'planned' && (
                      <form action={skipAction}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-amber-600 transition-colors">
                          Saltar
                        </button>
                      </form>
                    )}
                    {s.status === 'done' && s.session_id && (
                      <form action={unlinkAction}>
                        <button type="submit" className="text-xs text-muted-foreground hover:text-red-500 transition-colors">
                          Desvincular
                        </button>
                      </form>
                    )}
                  </div>

                </div>
              </li>
            )
          })}
        </ul>
      </div>

      {/* Delete */}
      <div className="pt-2">
        <DeletePlanButton id={id} title={plan.title} />
      </div>

    </main>
  )
}
