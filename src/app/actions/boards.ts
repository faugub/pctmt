'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export type BoardToken = {
  id: string
  x: number       // percentage (0-100) of court width
  y: number       // percentage (0-100) of court length
  team: 'own' | 'rival' | 'ball'
  label: string
}

export type BoardLine = {
  id: string
  x1: number
  y1: number
  x2: number
  y2: number
  dashed: boolean
}

export type BoardData = {
  tokens: BoardToken[]
  lines: BoardLine[]
}

const EMPTY_BOARD: BoardData = { tokens: [], lines: [] }

export async function createBoard(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const strategyId = (formData.get('strategy_id') as string) || null

  const { data: board, error } = await supabase
    .from('tactic_boards')
    .insert({
      coach_id: user.id,
      title: (formData.get('title') as string) || 'Pizarra sin título',
      strategy_id: strategyId,
      board_data: EMPTY_BOARD,
    })
    .select('id')
    .single()

  if (error || !board) throw new Error(error?.message ?? 'Error creating board')

  redirect(`/boards/${board.id}`)
}

/**
 * Persists the full board state (tokens + lines). Called directly from the
 * client editor — not bound to a <form> — so the canvas can autosave a few
 * hundred ms after the coach stops dragging, without a page navigation.
 */
export async function saveBoardData(id: string, boardData: BoardData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false as const, error: 'No autenticado' }

  const { error } = await supabase
    .from('tactic_boards')
    .update({ board_data: boardData, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) return { ok: false as const, error: error.message }
  return { ok: true as const }
}

export async function renameBoard(id: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tactic_boards')
    .update({ title: formData.get('title') as string })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/boards/${id}`)
}

export async function deleteBoard(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('tactic_boards')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/boards')
}
