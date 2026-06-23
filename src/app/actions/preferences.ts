'use server'

import { cookies } from 'next/headers'
import { locales } from '@/lib/i18n/dictionaries'

export async function setLocale(locale: string) {
  if (!(locales as readonly string[]).includes(locale)) return
  const cookieStore = await cookies()
  cookieStore.set('pctmt-lang', locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
}
