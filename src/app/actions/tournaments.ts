'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export async function createTournament(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tournament, error } = await supabase
    .from('tournaments')
    .insert({
      coach_id: user.id,
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: (formData.get('end_date') as string) || null,
      location: (formData.get('location') as string) || null,
      category: (formData.get('category') as string) || null,
    })
    .select('id')
    .single()

  if (error || !tournament) throw new Error(error?.message ?? 'Error creating tournament')

  redirect(`/tournaments/${tournament.id}`)
}

export async function updateTournament(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tournaments')
    .update({
      name: formData.get('name') as string,
      start_date: formData.get('start_date') as string,
      end_date: (formData.get('end_date') as string) || null,
      location: (formData.get('location') as string) || null,
      category: (formData.get('category') as string) || null,
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/tournaments/${id}`)
}

export async function addResult(tournamentId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase.from('tournament_results').insert({
    tournament_id: tournamentId,
    player_id: formData.get('player_id') as string,
    partner_name: (formData.get('partner_name') as string) || null,
    final_round: (formData.get('final_round') as string) || null,
    sets_won: formData.get('sets_won') ? Number(formData.get('sets_won')) : 0,
    sets_lost: formData.get('sets_lost') ? Number(formData.get('sets_lost')) : 0,
    notes: (formData.get('notes') as string) || null,
  })

  if (error) throw new Error(error.message)

  redirect(`/tournaments/${tournamentId}`)
}

export async function deleteResult(resultId: string, tournamentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tournament_results')
    .delete()
    .eq('id', resultId)

  if (error) throw new Error(error.message)

  redirect(`/tournaments/${tournamentId}`)
}

export async function deleteTournament(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tournaments')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/tournaments')
}
