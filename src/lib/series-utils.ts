/**
 * Pure date utilities for recurring-series logic.
 * No Supabase, no Next.js — safe to unit test directly.
 */

/** How far ahead to generate sessions when a series has no end date. */
export const OPEN_ENDED_HORIZON_DAYS = 90

/** Formats a UTC Date as a YYYY-MM-DD string. */
export function toDateOnly(d: Date): string {
  return d.toISOString().split('T')[0]
}

/**
 * Given a series definition, returns the list of calendar dates (YYYY-MM-DD)
 * that fall on the series' recurrence_days, between starts_on and the
 * effective end (ends_on, or starts_on + OPEN_ENDED_HORIZON_DAYS if open-ended).
 * Both starts_on and ends_on are inclusive.
 */
export function computeOccurrenceDates(
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

/**
 * Returns the date string (YYYY-MM-DD) for the day before the given date.
 * Used by the 'future' deletion scope to cap series.ends_on so that a
 * subsequent edit/generate doesn't regenerate the occurrences we just removed.
 */
export function capDateBefore(sessionDate: string): string {
  const d = new Date(sessionDate + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() - 1)
  return toDateOnly(d)
}
