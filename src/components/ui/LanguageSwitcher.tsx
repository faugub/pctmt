'use client'

import { useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { setLocale } from '@/app/actions/preferences'
import type { Locale } from '@/lib/i18n/dictionaries'

type Props = {
  locale: Locale
  label: string
}

export function LanguageSwitcher({ locale, label }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const change = (next: string) => {
    if (next === locale) return
    startTransition(async () => {
      await setLocale(next)
      router.refresh()
    })
  }

  return (
    <select
      aria-label={label}
      value={locale}
      disabled={isPending}
      onChange={(e) => change(e.target.value)}
      className="text-sm bg-transparent border border-border rounded-lg px-2 py-1.5 text-foreground hover:bg-muted transition-colors cursor-pointer"
    >
      <option value="es">ES</option>
      <option value="en">EN</option>
    </select>
  )
}
