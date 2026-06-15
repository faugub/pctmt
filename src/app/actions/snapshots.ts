'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createSnapshot(playerId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Verify the player belongs to this coach (belt + suspenders on top of RLS)
  const { data: player } = await supabase
    .from('players')
    .select('id')
    .eq('id', playerId)
    .eq('coach_id', user.id)
    .single()
  if (!player) redirect('/players')

  const score = (field: string) => {
    const v = formData.get(field)
    return v ? Number(v) : null
  }

  const payload = {
    player_id: playerId,
    recorded_at: (formData.get('recorded_at') as string) || new Date().toISOString().split('T')[0],
    weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
    height_cm: formData.get('height_cm') ? Number(formData.get('height_cm')) : null,
    endurance_score: score('endurance_score'),
    speed_score: score('speed_score'),
    strength_score: score('strength_score'),
    technique_score: score('technique_score'),
    notes: (formData.get('notes') as string) || null,
  }

  const { error } = await supabase.from('player_snapshots').insert(payload)
  if (error) throw new Error(error.message)

  redirect(`/players/${playerId}`)
}

export async function deleteSnapshot(snapshotId: string, playerId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('player_snapshots')
    .delete()
    .eq('id', snapshotId)

  if (error) throw new Error(error.message)

  redirect(`/players/${playerId}`)
}
