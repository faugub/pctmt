'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function enablePlayerShare(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('players')
    .update({ share_enabled: true })
    .eq('id', playerId)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/players/${playerId}`)
}

export async function disablePlayerShare(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('players')
    .update({ share_enabled: false })
    .eq('id', playerId)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/players/${playerId}`)
}

/**
 * Regenerates the share token, invalidating any previously shared link.
 * Useful if a coach accidentally shared a link with the wrong person.
 */
export async function regenerateShareToken(playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('players')
    .update({ share_token: crypto.randomUUID() })
    .eq('id', playerId)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  revalidatePath(`/players/${playerId}`)
}
