'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type PlanTargetType = 'group' | 'individual'

export async function createPlan(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const targetType = formData.get('target_type') as PlanTargetType
  const targetId = formData.get('target_id') as string
  const totalSessions = Number(formData.get('total_sessions')) || 1

  const { data: plan, error } = await supabase
    .from('training_plans')
    .insert({
      coach_id: user.id,
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      target_type: targetType,
      target_id: targetId,
      total_sessions: totalSessions,
      status: 'active',
      starts_on: formData.get('starts_on') as string,
      goal_description: (formData.get('goal_description') as string) || null,
    })
    .select('id')
    .single()

  if (error || !plan) throw new Error(error?.message ?? 'Error creating plan')

  // Pre-create one plan_sessions slot per planned session, unassigned to a
  // phase and not yet linked to a real session. The coach fills these in
  // from the plan detail page.
  const slots = Array.from({ length: totalSessions }, (_, i) => ({
    plan_id: plan.id,
    session_number: i + 1,
    status: 'planned' as const,
  }))

  const { error: slotsError } = await supabase.from('plan_sessions').insert(slots)
  if (slotsError) throw new Error(slotsError.message)

  redirect(`/plans/${plan.id}?notice=${encodeURIComponent('Plan creado')}&notice_variant=success`)
}

export async function updatePlan(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('training_plans')
    .update({
      title: formData.get('title') as string,
      description: (formData.get('description') as string) || null,
      status: formData.get('status') as string,
      goal_description: (formData.get('goal_description') as string) || null,
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/plans/${id}?notice=${encodeURIComponent('Cambios guardados')}&notice_variant=success`)
}

export async function deletePlan(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('training_plans')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/plans')
}

export async function addPhase(planId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify plan ownership before inserting a phase under it.
  const { data: plan } = await supabase
    .from('training_plans')
    .select('id')
    .eq('id', planId)
    .eq('coach_id', user.id)
    .single()

  if (!plan) throw new Error('Plan not found')

  const { count } = await supabase
    .from('plan_phases')
    .select('id', { count: 'exact', head: true })
    .eq('plan_id', planId)

  const { error } = await supabase.from('plan_phases').insert({
    plan_id: planId,
    title: formData.get('title') as string,
    sort_order: count ?? 0,
    session_count: Number(formData.get('session_count')) || 0,
    objectives: (formData.get('objectives') as string) || null,
    notes: (formData.get('notes') as string) || null,
    color: (formData.get('color') as string) || null,
  })

  if (error) throw new Error(error.message)

  revalidatePath(`/plans/${planId}`)
}

export async function deletePhase(phaseId: string, planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Ownership enforced via the plan_phases RLS policy (joins to training_plans
  // by coach_id), no extra check needed here.
  const { error } = await supabase.from('plan_phases').delete().eq('id', phaseId)
  if (error) throw new Error(error.message)

  revalidatePath(`/plans/${planId}`)
}

/**
 * Assigns a plan_sessions slot to a phase and/or a set of training blocks.
 * Used when the coach plans out what each upcoming session will cover.
 */
export async function updatePlanSession(planSessionId: string, planId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const phaseId = (formData.get('phase_id') as string) || null
  const blockIds = formData.getAll('block_ids') as string[]

  const { error } = await supabase
    .from('plan_sessions')
    .update({
      phase_id: phaseId,
      block_ids: blockIds,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', planSessionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/plans/${planId}`)
}

/**
 * Links a plan_sessions slot to a real session — called when the coach marks
 * that a planned session actually happened. Flips status to 'done'.
 */
export async function linkSessionToPlan(planSessionId: string, planId: string, sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('plan_sessions')
    .update({ session_id: sessionId, status: 'done' })
    .eq('id', planSessionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/plans/${planId}`)
}

export async function markPlanSessionSkipped(planSessionId: string, planId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('plan_sessions')
    .update({ status: 'skipped' })
    .eq('id', planSessionId)

  if (error) throw new Error(error.message)

  revalidatePath(`/plans/${planId}`)
}
