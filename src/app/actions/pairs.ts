'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createPair(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const player1_id = formData.get('player1_id') as string
  const player2_id = formData.get('player2_id') as string

  if (!player1_id || !player2_id) throw new Error('Seleccioná dos jugadores')
  if (player1_id === player2_id) throw new Error('Los dos jugadores deben ser distintos')

  const { data: pair, error } = await supabase
    .from('pairs')
    .insert({
      coach_id: user.id,
      player1_id,
      player2_id,
      name: (formData.get('name') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (error || !pair) throw new Error(error?.message ?? 'Error al crear la sociedad')

  redirect(`/pairs/${pair.id}?notice=${encodeURIComponent('Sociedad creada')}&notice_variant=success`)
}

export async function updatePair(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('pairs')
    .update({
      name:  (formData.get('name')  as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/pairs/${id}?notice=${encodeURIComponent('Cambios guardados')}&notice_variant=success`)
}

export async function deletePair(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('pairs')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/pairs')
}
