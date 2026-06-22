'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// How far ahead to generate concrete sessions when a series has no end date.
// Re-running "generate" later extends the horizon without duplicating past sessions.
const OPEN_ENDED_HORIZON_DAYS = 90

function toDateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Given a series definition, returns the list of calendar dates (YYYY-MM-DD)
 * that fall on the series' recurrence_days, between starts_on and the
 * effective end (ends_on, or starts_on + OPEN_ENDED_HORIZON_DAYS if open-ended).
 */
function computeOccurrenceDates(
  startsOn: string,
  endsOn: string | null,
  recurrenceDays: number[]
): string[] {
  const start = new Date(startsOn + 'T00:00:00Z')
  const end = endsOn
    ? new Date(endsOn + 'T00:00:00Z')
    : new Date(start.getTime() + OPEN_ENDED_HORIZON_DAYS * 24 * 60 * 60 * 1000)

  const days = new Set(recurrenceDays)
  const dates: string[] = []

  const cursor = new Date(start)
  while (cursor <= end) {
    if (days.has(cursor.getUTCDay())) {
      dates.push(toDateOnly(cursor))
    }
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }

  return dates
}

export async function createSeries(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const recurrenceDays = (formData.getAll('recurrence_days') as string[]).map(Number)
  const playerIds = formData.getAll('player_ids') as string[]
  const endsOn = (formData.get('ends_on') as string) || null
  const startsOn = formData.get('starts_on') as string

  const { data: series, error } = await supabase
    .from('session_series')
    .insert({
      coach_id: user.id,
      title: formData.get('title') as string,
      session_type: formData.get('session_type') as string,
      category: (formData.get('category') as string) || null,
      level: (formData.get('level') as string) || null,
      recurrence_days: recurrenceDays,
      start_time: formData.get('start_time') as string,
      duration_min: Number(formData.get('duration_min')) || 60,
      starts_on: startsOn,
      ends_on: endsOn,
      player_ids: playerIds,
      notes: (formData.get('notes') as string) || null,
    })
    .select('id')
    .single()

  if (error || !series) throw new Error(error?.message ?? 'Error creating series')

  await generateSessionsForSeries(series.id)

  redirect(`/calendar`)
}

/**
 * Generates concrete `sessions` rows for a series, for any occurrence dates
 * that don't already have a session. Safe to call repeatedly — e.g. when
 * extending an open-ended series further into the future.
 */
export async function generateSessionsForSeries(seriesId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: series, error: seriesError } = await supabase
    .from('session_series')
    .select('*')
    .eq('id', seriesId)
    .eq('coach_id', user.id)
    .single()

  if (seriesError || !series) throw new Error(seriesError?.message ?? 'Series not found')

  const occurrenceDates = computeOccurrenceDates(
    series.starts_on,
    series.ends_on,
    series.recurrence_days
  )

  const { data: existing } = await supabase
    .from('sessions')
    .select('series_index')
    .eq('series_id', seriesId)

  const existingIndexes = new Set((existing ?? []).map((r) => r.series_index))

  const rowsToCreate = occurrenceDates
    .map((date, index) => ({ date, index }))
    .filter(({ index }) => !existingIndexes.has(index))

  if (rowsToCreate.length === 0) return

  const sessionTypeMap: Record<string, string> = {
    academy: 'mixed',
    individual: 'mixed',
    pairs: 'mixed',
  }

  const newSessions = rowsToCreate.map(({ date, index }) => ({
    coach_id: user.id,
    title: series.title,
    session_date: date,
    duration_min: series.duration_min,
    session_type: sessionTypeMap[series.session_type] ?? 'mixed',
    objectives: null,
    notes: series.notes,
    series_id: seriesId,
    series_index: index,
  }))

  const { data: created, error: insertError } = await supabase
    .from('sessions')
    .insert(newSessions)
    .select('id')

  if (insertError) throw new Error(insertError.message)
  if (!created) return

  if (series.player_ids && series.player_ids.length > 0) {
    const attendanceRows = created.flatMap((s: { id: string }) =>
      (series.player_ids as string[]).map((pid) => ({
        session_id: s.id,
        player_id: pid,
        attended: true,
      }))
    )
    const { error: spError } = await supabase.from('session_players').insert(attendanceRows)
    if (spError) throw new Error(spError.message)
  }
}

/**
 * Edits a single occurrence within a series without touching the series
 * template or any other generated session. This is the "only this" scope —
 * e.g. the coach moves just this Tuesday's class to a different time.
 */
export async function updateSingleSessionInSeries(sessionId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { error } = await supabase
    .from('sessions')
    .update({
      title: formData.get('title') as string,
      session_date: formData.get('session_date') as string,
      duration_min: formData.get('duration_min') ? Number(formData.get('duration_min')) : null,
      objectives: (formData.get('objectives') as string) || null,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', sessionId)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect(`/sessions/${sessionId}`)
}

type EditScope = 'this' | 'future' | 'all'

/**
 * Updates the series template. `scope` controls which generated sessions are affected:
 * - 'this'   → only the series template changes; no existing sessions are touched.
 *              Use updateSingleSessionInSeries() instead if the coach wants to edit
 *              just one occurrence's own fields (date, notes, etc).
 * - 'future' → deletes and regenerates all sessions from sessionIndex onward
 * - 'all'    → deletes and regenerates every session in the series
 * Past attendance on regenerated sessions is intentionally not preserved —
 * only call 'future'/'all' before those sessions have occurred.
 */
export async function updateSeries(
  id: string,
  scope: EditScope,
  sessionIndex: number | null,
  formData: FormData
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const recurrenceDays = (formData.getAll('recurrence_days') as string[]).map(Number)
  const playerIds = formData.getAll('player_ids') as string[]
  const endsOn = (formData.get('ends_on') as string) || null

  const { error } = await supabase
    .from('session_series')
    .update({
      title: formData.get('title') as string,
      session_type: formData.get('session_type') as string,
      category: (formData.get('category') as string) || null,
      level: (formData.get('level') as string) || null,
      recurrence_days: recurrenceDays,
      start_time: formData.get('start_time') as string,
      duration_min: Number(formData.get('duration_min')) || 60,
      ends_on: endsOn,
      player_ids: playerIds,
      notes: (formData.get('notes') as string) || null,
    })
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  if (scope === 'all') {
    await supabase.from('sessions').delete().eq('series_id', id).eq('coach_id', user.id)
  } else if (scope === 'future' && sessionIndex !== null) {
    await supabase
      .from('sessions')
      .delete()
      .eq('series_id', id)
      .eq('coach_id', user.id)
      .gte('series_index', sessionIndex)
  }
  // scope === 'this': series template updates, but no existing sessions are touched —
  // only newly generated future occurrences will reflect the change.

  if (scope !== 'this') {
    await generateSessionsForSeries(id)
  }

  redirect('/calendar')
}

/**
 * Deletes a series template. By default (cascade = false) any sessions
 * already generated from it are left behind as one-off sessions, since
 * ON DELETE SET NULL on sessions.series_id detaches them automatically —
 * this preserves history (attendance, notes) for classes that already
 * happened. Pass cascade = true to also delete every generated session,
 * including its history, when the coach wants the whole series gone.
 */
export async function deleteSeries(id: string, cascade: boolean) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  if (cascade) {
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('series_id', id)
      .eq('coach_id', user.id)

    if (sessionsError) throw new Error(sessionsError.message)
  }

  const { error } = await supabase
    .from('session_series')
    .delete()
    .eq('id', id)
    .eq('coach_id', user.id)

  if (error) throw new Error(error.message)

  redirect('/calendar')
}

type DeleteScope = 'this' | 'future' | 'all'

/**
 * Deletes a session that may belong to a series, with the same "this /
 * future / all" scoping the coach already has for edits:
 * - 'this'   → deletes only this one session. Works the same whether or
 *              not it belongs to a series.
 * - 'future' → deletes this occurrence and every later one in the series,
 *              then caps the series' ends_on the day before this date so
 *              a future edit doesn't regenerate the ones we just removed.
 *              Past occurrences (and their attendance history) are kept.
 * - 'all'    → deletes the entire series, including every past and future
 *              session generated from it.
 * For a session with no series_id, every scope behaves like 'this'.
 */
export async function deleteSeriesOccurrence(sessionId: string, scope: DeleteScope) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: session, error: sessionError } = await supabase
    .from('sessions')
    .select('id, series_id, series_index, session_date')
    .eq('id', sessionId)
    .eq('coach_id', user.id)
    .single()

  if (sessionError || !session) throw new Error(sessionError?.message ?? 'Session not found')

  if (!session.series_id || scope === 'this') {
    const { error } = await supabase
      .from('sessions')
      .delete()
      .eq('id', sessionId)
      .eq('coach_id', user.id)

    if (error) throw new Error(error.message)
    redirect('/calendar')
  }

  if (scope === 'all') {
    const { error: sessionsError } = await supabase
      .from('sessions')
      .delete()
      .eq('series_id', session.series_id)
      .eq('coach_id', user.id)

    if (sessionsError) throw new Error(sessionsError.message)

    const { error: seriesErr } = await supabase
      .from('session_series')
      .delete()
      .eq('id', session.series_id)
      .eq('coach_id', user.id)

    if (seriesErr) throw new Error(seriesErr.message)
    redirect('/calendar')
  }

  // scope === 'future': remove this occurrence and everything after it.
  const { error: deleteError } = await supabase
    .from('sessions')
    .delete()
    .eq('series_id', session.series_id)
    .eq('coach_id', user.id)
    .gte('series_index', session.series_index)

  if (deleteError) throw new Error(deleteError.message)

  const dayBefore = new Date(session.session_date + 'T00:00:00Z')
  dayBefore.setUTCDate(dayBefore.getUTCDate() - 1)

  const { error: capError } = await supabase
    .from('session_series')
    .update({ ends_on: toDateOnly(dayBefore) })
    .eq('id', session.series_id)
    .eq('coach_id', user.id)

  if (capError) throw new Error(capError.message)

  redirect('/calendar')
}
