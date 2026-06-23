import { cookies } from 'next/headers'
import { defaultLocale, locales, type Locale } from './dictionaries'

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies()
  const value = cookieStore.get('pctmt-lang')?.value ?? ''
  return (locales as readonly string[]).includes(value) ? (value as Locale) : defaultLocale
}
