import { describe, it, expect } from 'vitest'
import {
  computeOccurrenceDates,
  capDateBefore,
  OPEN_ENDED_HORIZON_DAYS,
} from '../series-utils'

// Weekday reference (UTC):
//   2026-01-01 = Thursday (4)
//   2026-01-05 = Monday   (1)
//   2026-01-06 = Tuesday  (2)
//   2026-01-08 = Thursday (4)
//   2025-12-29 = Monday   (1)

describe('computeOccurrenceDates', () => {
  it('returns dates on matching weekday only (Mon × 3 weeks)', () => {
    const dates = computeOccurrenceDates('2026-01-05', '2026-01-19', [1])
    expect(dates).toEqual(['2026-01-05', '2026-01-12', '2026-01-19'])
  })

  it('supports multiple recurrence days (Tue + Thu)', () => {
    const dates = computeOccurrenceDates('2026-01-06', '2026-01-15', [2, 4])
    expect(dates).toEqual(['2026-01-06', '2026-01-08', '2026-01-13', '2026-01-15'])
  })

  it('returns empty array when no day in range matches', () => {
    // Sunday (0) never appears in a Mon-only week
    const dates = computeOccurrenceDates('2026-01-05', '2026-01-11', [0])
    expect(dates).toEqual([])
  })

  it('includes starts_on when it matches the recurrence day', () => {
    const dates = computeOccurrenceDates('2026-01-05', '2026-01-05', [1])
    expect(dates).toEqual(['2026-01-05'])
  })

  it('excludes starts_on when it does not match the recurrence day', () => {
    // 2026-01-05 is Monday (1); requesting Sunday (0)
    const dates = computeOccurrenceDates('2026-01-05', '2026-01-05', [0])
    expect(dates).toEqual([])
  })

  it('open-ended: first date is starts_on, last date ≤ horizon, correct count', () => {
    // Mon 2026-01-05; horizon = 90 days → 2026-04-05 (Sunday) → last Mon = 2026-03-30
    const dates = computeOccurrenceDates('2026-01-05', null, [1])
    expect(dates[0]).toBe('2026-01-05')
    expect(dates[dates.length - 1]).toBe('2026-03-30')
    expect(dates).toHaveLength(13)
  })

  it('open-ended: every returned date is within OPEN_ENDED_HORIZON_DAYS', () => {
    const start = '2026-01-05'
    const startMs = new Date(start + 'T00:00:00Z').getTime()
    const horizonMs = OPEN_ENDED_HORIZON_DAYS * 24 * 60 * 60 * 1000
    const dates = computeOccurrenceDates(start, null, [1])
    for (const d of dates) {
      const diff = new Date(d + 'T00:00:00Z').getTime() - startMs
      expect(diff).toBeLessThanOrEqual(horizonMs)
    }
  })

  it('handles month boundary (Jan → Feb)', () => {
    // 2026-01-29 and 2026-02-05 are both Thursdays
    const dates = computeOccurrenceDates('2026-01-29', '2026-02-05', [4])
    expect(dates).toEqual(['2026-01-29', '2026-02-05'])
  })

  it('handles year boundary (Dec → Jan)', () => {
    // 2025-12-29 and 2026-01-05 are both Mondays
    const dates = computeOccurrenceDates('2025-12-29', '2026-01-05', [1])
    expect(dates).toEqual(['2025-12-29', '2026-01-05'])
  })

  it('returns all matching days in order with no duplicates', () => {
    const dates = computeOccurrenceDates('2026-01-05', '2026-01-19', [1])
    const sorted = [...dates].sort()
    expect(dates).toEqual(sorted)
    expect(new Set(dates).size).toBe(dates.length)
  })
})

describe('capDateBefore', () => {
  it('returns the day before for a regular mid-month date', () => {
    expect(capDateBefore('2026-07-15')).toBe('2026-07-14')
  })

  it('handles month boundary — start of month → last day of prior month', () => {
    expect(capDateBefore('2026-07-01')).toBe('2026-06-30')
  })

  it('handles year boundary — Jan 1 → Dec 31 of prior year', () => {
    expect(capDateBefore('2026-01-01')).toBe('2025-12-31')
  })

  it('handles leap year — Mar 1 → Feb 29', () => {
    expect(capDateBefore('2024-03-01')).toBe('2024-02-29')
  })

  it('handles non-leap year — Mar 1 → Feb 28', () => {
    expect(capDateBefore('2025-03-01')).toBe('2025-02-28')
  })

  it('handles last day of a short month — Mar 1 is always the day after Feb end', () => {
    // 2023 non-leap, 2024 leap
    expect(capDateBefore('2023-03-01')).toBe('2023-02-28')
    expect(capDateBefore('2024-03-01')).toBe('2024-02-29')
  })
})
