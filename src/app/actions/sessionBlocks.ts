'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Attaches a library block to a session, appended at the end. Ownership is
 * enforced by RLS on session_blocks (scoped via session_id's coach_id) —
 * there's no coach_id column on this table to filter by directly.
 */
export async function addBlockToSession(sessionId: string, blockId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: existing } = await supabase
    .from('session_blocks')
    .select('sort_order')
    .eq('session_id', sessionId)
    .order('sort_order', { ascending: false })
    .limit(1)

  const nextOrder = existing && existing.length > 0 ? existing[0].sort_order + 1 : 0

  const { data, error } = await supabase
    .from('session_blocks')
    .insert({ session_id: sessionId, block_id: blockId, sort_order: nextOrder })
    .select('id, sort_order')
    .single()

  if (error || !data) return { ok: false as const, error: error?.message ?? 'Error' }
  return { ok: true as const, id: data.id, sortOrder: data.sort_order }
}

export async function removeSessionBlock(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('session_blocks').delete().eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function toggleSessionBlockCompleted(id: string, completed: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('session_blocks').update({ completed }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function reorderSessionBlock(id: string, newSortOrder: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('session_blocks').update({ sort_order: newSortOrder }).eq('id', id)
  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}
