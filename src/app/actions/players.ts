'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPlayer(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload = {
    coach_id: user.id,
    full_name: formData.get('full_name') as string,
    birth_date: (formData.get('birth_date') as string) || null,
    dominant_hand: (formData.get('dominant_hand') as string) || null,
    level: (formData.get('level') as string) || null,
    weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
    height_cm: formData.get('height_cm') ? Number(formData.get('height_cm')) : null,
  }

  const { error } = await supabase.from('players').insert(payload)
  if (error) throw new Error(error.message)

  redirect(`/players?notice=${encodeURIComponent('Jugador creado')}&notice_variant=success`)
}

export async function updatePlayer(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const payload = {
    full_name: formData.get('full_name') as string,
    birth_date: (formData.get('birth_date') as string) || null,
    dominant_hand: (formData.get('dominant_hand') as string) || null,
    level: (formData.get('level') as string) || null,
    weight_kg: formData.get('weight_kg') ? Number(formData.get('weight_kg')) : null,
    height_cm: formData.get('height_cm') ? Number(formData.get('height_cm')) : null,
  }

  const { error } = await supabase.from('players').update(payload).eq('id', id).eq('coach_id', user.id)
  if (error) throw new Error(error.message)

  redirect(`/players/${id}?notice=${encodeURIComponent('Cambios guardados')}&notice_variant=success`)
}

export async function deletePlayer(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('players').delete().eq('id', id).eq('coach_id', user.id)
  if (error) throw new Error(error.message)

  redirect('/players')
}
