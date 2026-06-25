import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/EmptyState'

const STATUS_LABEL: Record<string, string> = {
  active: 'Activo',
  completed: 'Completado',
  paused: 'En pausa',
  cancelled: 'Cancelado',
}

const STATUS_COLOR: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  completed: 'bg-blue-100 text-blue-700',
  paused: 'bg-amber-100 text-amber-700',
  cancelled: 'bg-gray-100 text-gray-500',
}

type PlanRow = {
  id: string
  title: string
  target_type: 'group' | 'individual'
  target_id: string
  total_sessions: number
  status: string
}

export default async function PlansPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: plans, error } = await supabase
    .from('training_plans')
    .select('id, title, target_type, target_id, total_sessions, status')
    .order('created_at', { ascending: false }) as { data: PlanRow[] | null; error: unknown }

  if (error) throw new Error(String(error))

  // Resolve polymorphic target names. target_id points to either
  // session_series or players depending on target_type — see
  // architecture.md "Polymorphic target pattern".
  const groupIds = (plans ?? []).filter((p) => p.target_type === 'group').map((p) => p.target_id)
  const individualIds = (plans ?? []).filter((p) => p.target_type === 'individual').map((p) => p.target_id)

  const [{ data: seriesNames }, { data: playerNames }] = await Promise.all([
    groupIds.length > 0
      ? supabase.from('session_series').select('id, title').in('id', groupIds)
      : Promise.resolve({ data: [] as { id: string; title: string }[] }),
    individualIds.length > 0
      ? supabase.from('players').select('id, full_name').in('id', individualIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ])

  const seriesMap = new Map((seriesNames ?? []).map((s) => [s.id, s.title]))
  const playerMap = new Map((playerNames ?? []).map((p) => [p.id, p.full_name]))

  function targetLabel(plan: PlanRow) {
    return plan.target_type === 'group'
      ? seriesMap.get(plan.target_id) ?? 'Serie eliminada'
      : playerMap.get(plan.target_id) ?? 'Jugador eliminado'
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Planes de trabajo</h1>
          <p className="text-sm text-muted-foreground mt-0.5">{plans?.length ?? 0} registrados</p>
        </div>
        <Link
          href="/plans/new"
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
        >
          + Nuevo plan
        </Link>
      </div>

      {plans && plans.length > 0 ? (
        <ul className="space-y-2">
          {plans.map((p) => (
            <li key={p.id}>
              <Link
                href={`/plans/${p.id}`}
                className="flex items-center justify-between px-5 py-4 bg-card border border-border rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{p.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {targetLabel(p)} · {p.total_sessions} sesiones
                  </p>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLOR[p.status] ?? 'bg-muted text-muted-foreground'}`}>
                  {STATUS_LABEL[p.status] ?? p.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState
          icon="🗺️"
          title="Todavía no tienes planes de trabajo."
          action={{ href: '/plans/new', label: 'Crea el primero' }}
        />
      )}
    </main>
  )
}
