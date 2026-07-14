import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const STATUS_LABEL: Record<string, string> = {
  active:    'Activo',
  completed: 'Completado',
  paused:    'En pausa',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  active:    'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused:    'bg-amber-100 text-amber-700',
  cancelled: 'bg-muted text-muted-foreground',
}

type PlanRow = {
  id: string
  title: string
  target_type: 'group' | 'individual'
  target_id: string
  total_sessions: number
  status: string
  plan_sessions: { status: string }[]
}

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans, error } = await supabase
    .from('training_plans')
    .select('id, title, target_type, target_id, total_sessions, status, plan_sessions(status)')
    .order('created_at', { ascending: false }) as { data: PlanRow[] | null; error: unknown }

  if (error) throw new Error(String(error))

  const groupIds      = (plans ?? []).filter(p => p.target_type === 'group').map(p => p.target_id)
  const individualIds = (plans ?? []).filter(p => p.target_type === 'individual').map(p => p.target_id)

  const [{ data: seriesNames }, { data: playerNames }] = await Promise.all([
    groupIds.length > 0
      ? supabase.from('session_series').select('id, title').in('id', groupIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    individualIds.length > 0
      ? supabase.from('players').select('id, full_name').in('id', individualIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ])

  const seriesMap = new Map((seriesNames ?? []).map(s => [s.id, s.title]))
  const playerMap = new Map((playerNames ?? []).map(p => [p.id, p.full_name]))

  function targetLabel(plan: PlanRow) {
    return plan.target_type === 'group'
      ? seriesMap.get(plan.target_id) ?? 'Serie eliminada'
      : playerMap.get(plan.target_id) ?? 'Jugador eliminado'
  }

  function progress(plan: PlanRow) {
    const done  = (plan.plan_sessions ?? []).filter(ps => ps.status === 'done').length
    const total = Math.max(plan.total_sessions, 1)
    return { done, pct: Math.round((done / total) * 100) }
  }

  const activePlans = (plans ?? []).filter(p => p.status === 'active')
  const otherPlans  = (plans ?? []).filter(p => p.status !== 'active')
  const isEmpty     = (plans ?? []).length === 0

  return (
    <main className="max-w-lg mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Planes de trabajo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{(plans ?? []).length} registrados</p>
        </div>
        <Link
          href="/plans/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo
        </Link>
      </div>

      {isEmpty ? (
        <EmptyState
          icon="🗺️"
          title="Todavía no tienes planes de trabajo."
          action={{ href: '/plans/new', label: 'Crea el primero' }}
        />
      ) : (
        <div className="space-y-8">

          {/* Activos */}
          {activePlans.length > 0 && (
            <section>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Activos</p>
              <div className="space-y-3">
                {activePlans.map(p => <PlanCard key={p.id} plan={p} label={targetLabel(p)} prog={progress(p)} />)}
              </div>
            </section>
          )}

          {/* Resto */}
          {otherPlans.length > 0 && (
            <section>
              {activePlans.length > 0 && (
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-3">Anteriores</p>
              )}
              <div className="bg-card border border-border rounded-2xl overflow-hidden divide-y divide-border">
                {otherPlans.map(p => <PlanCardCompact key={p.id} plan={p} label={targetLabel(p)} prog={progress(p)} />)}
              </div>
            </section>
          )}

        </div>
      )}
    </main>
  )
}

// ── sub-components ────────────────────────────────────────────────────────────

const STATUS_LABEL_LOCAL: Record<string, string> = {
  active: 'Activo', completed: 'Completado', paused: 'En pausa', cancelled: 'Cancelado',
}
const STATUS_COLOR_LOCAL: Record<string, string> = {
  active: 'bg-green-100 text-green-700', completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700', cancelled: 'bg-muted text-muted-foreground',
}

type PlanCardProps = {
  plan: PlanRow
  label: string
  prog: { done: number; pct: number }
}

function PlanCard({ plan, label, prog }: PlanCardProps) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="block bg-card border border-border rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground">{plan.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {plan.target_type === 'individual' ? 'Individual' : 'Grupo'} · {label}
          </p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
          STATUS_COLOR_LOCAL[plan.status] ?? 'bg-muted text-muted-foreground'
        }`}>
          {STATUS_LABEL_LOCAL[plan.status] ?? plan.status}
        </span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-1.5">
        <div className="h-full bg-primary rounded-full" style={{ width: `${prog.pct}%` }} />
      </div>
      <p className="text-xs text-muted-foreground text-right">
        {prog.done}/{plan.total_sessions} sesiones · {prog.pct}%
      </p>
    </Link>
  )
}

function PlanCardCompact({ plan, label, prog }: PlanCardProps) {
  return (
    <Link
      href={`/plans/${plan.id}`}
      className="flex items-center gap-4 px-5 py-3.5 hover:bg-muted transition-colors"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{plan.title}</p>
        <div className="flex items-center gap-2 mt-1">
          <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-muted-foreground/40 rounded-full" style={{ width: `${prog.pct}%` }} />
          </div>
          <span className="text-xs text-muted-foreground flex-shrink-0">{prog.pct}%</span>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{label}</p>
      </div>
      <span className={`text-xs font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
        STATUS_COLOR_LOCAL[plan.status] ?? 'bg-muted text-muted-foreground'
      }`}>
        {STATUS_LABEL_LOCAL[plan.status] ?? plan.status}
      </span>
    </Link>
  )
}
