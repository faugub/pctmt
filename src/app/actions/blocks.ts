'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

function parseTags(raw: string): string[] {
  return raw
    .split(',')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean)
}

export async function createBlock(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const durationRaw = formData.get('duration_min') as string
  const strategyRaw = formData.get('strategy_id') as string

  const { data: block, error } = await supabase
    .from('training_blocks')
    .insert({
      coach_id: user.id,
      title: formData.get('title') as string,
      block_type: formData.get('block_type') as string,
      description: (formData.get('description') as string) || null,
      duration_min: durationRaw ? parseInt(durationRaw, 10) : null,
      tags: parseTags((formData.get('tags') as string) ?? ''),
      strategy_id: strategyRaw || null,
      concept_tags: formData.getAll('concept_tags') as string[],
      decision_tags: formData.getAll('decision_tags') as string[],
    })
    .select('id')
    .single()

  if (error || !block) throw new Error(error?.message ?? 'Error creating training block')

  redirect(`/blocks/${block.id}?notice=${encodeURIComponent('Bloque creado')}&notice_variant=success`)
}

export async function updateBlock(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const durationRaw = formData.get('duration_min') as string
  const strategyRaw = formData.get('strategy_id') as string

  const { error } = await supabase
    .from('training_blocks')
    .update({
      title: formData.get('title') as string,
      block_type: formData.get('block_type') as string,
      description: (formData.get('description') as string) || null,
      duration_min: durationRaw ? parseInt(durationRaw, 10) : null,
      tags: parseTags((formData.get('tags') as string) ?? ''),
      strategy_id: strategyRaw || null,
      concept_tags: formData.getAll('concept_tags') as string[],
      decision_tags: formData.getAll('decision_tags') as string[],
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/blocks/${id}?notice=${encodeURIComponent('Cambios guardados')}&notice_variant=success`)
}

export async function deleteBlock(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('training_blocks')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/blocks')
}
