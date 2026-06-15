'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createSession(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const playerIds = formData.getAll('player_ids') as string[]

  const { data: session, error } = await supabase
    .from('sessions')
    .insert({
      coach_id: user.id,
      title: formData.get('title') as string,
      session_date: formData.get('session_date') as string,
      duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
      session_type: (formData.get('session_type') as string) || null,
      objectives: (formData.get('objectives') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (error || !session) throw new Error(error?.message ?? 'Error creating session')

  if (playerIds.length > 0) {
    const rows = playerIds.map((pid) => ({
      session_id: session.id,
      player_id: pid,
      attended: true,
    }))
    const { error: spError } = await supabase.from('session_players').insert(rows)
    if (spError) throw new Error(spError.message)
  }

  redirect(`/sessions/${session.id}`)
}

export async function updateSession(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('sessions')
    .update({
      title: formData.get('title') as string,
      session_date: formData.get('session_date') as string,
      duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
      session_type: (formData.get('session_type') as string) || null,
      objectives: (formData.get('objectives') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/sessions/${id}`)
}

export async function updateAttendance(sessionId: string, playerId: string, attended: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase
    .from('session_players')
    .update({ attended })
    .eq('session_id', sessionId)
    .eq('player_id', playerId)
}

export async function deleteSession(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('sessions')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/sessions')
}
