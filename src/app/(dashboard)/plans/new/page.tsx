import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { PlanForm } from '@/components/ui/PlanForm'
import { createPlan } from '@/app/actions/plans'

export default async function NewPlanPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: series }, { data: players }] = await Promise.all([
    supabase.from('session_series').select('id, title').order('title', { ascending: true }),
    supabase.from('players').select('id, full_name').order('full_name', { ascending: true }),
  ])

  return (
    <main className="max-w-lg mx-auto px-6 py-10">
      <Link href="/plans" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
        ← Planes
      </Link>
      <h1 className="text-2xl font-semibold text-foreground mt-4 mb-1">Nuevo plan</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Define cuántas sesiones componen el plan. Después podrás organizarlas en fases.
      </p>
      <div className="bg-card border border-border rounded-2xl shadow-sm p-6">
        <PlanForm action={createPlan} series={series ?? []} players={players ?? []} submitLabel="Crear plan" />
      </div>
    </main>
  )
}
