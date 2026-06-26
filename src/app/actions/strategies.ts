'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export async function createStrategy(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: strategy, error } = await supabase
    .from('strategies')
    .insert({
      coach_id: user.id,
      title: formData.get('title') as string,
      court_zone: (formData.get('court_zone') as string) || null,
      description: (formData.get('description') as string) || null,
      tags: parseTags(formData.get('tags') as string ?? ''),
      concept_tags: formData.getAll('concept_tags') as string[],
      decision_tags: formData.getAll('decision_tags') as string[],
    })
    .select('id')
    .single()

  if (error || !strategy) throw new Error(error?.message ?? 'Error creating strategy')

  redirect(`/strategies/${strategy.id}?notice=${encodeURIComponent('Estrategia creada')}&notice_variant=success`)
}

export async function updateStrategy(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('strategies')
    .update({
      title: formData.get('title') as string,
      court_zone: (formData.get('court_zone') as string) || null,
      description: (formData.get('description') as string) || null,
      tags: parseTags(formData.get('tags') as string ?? ''),
      concept_tags: formData.getAll('concept_tags') as string[],
      decision_tags: formData.getAll('decision_tags') as string[],
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/strategies/${id}?notice=${encodeURIComponent('Cambios guardados')}&notice_variant=success`)
}

export async function deleteStrategy(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('strategies')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/strategies')
}
