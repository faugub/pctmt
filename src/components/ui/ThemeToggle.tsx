'use client'

import { useEffect, useState } from 'react'

type Props = {
  labelLight: string
  labelDark: string
}

export function ThemeToggle({ labelLight, labelDark }: Props) {
  const [isDark, setIsDark] = useState<boolean | null>(null)

  useEffect(() => {
    setIsDark(document.documentElement.classList.contains('dark'))
  }, [])

  const toggle = () => {
    const next = !document.documentElement.classList.contains('dark')
    document.documentElement.classList.toggle('dark', next)
    try { localStorage.setItem('pctmt-theme', next ? 'dark' : 'light') } catch {}
    setIsDark(next)
  }

  if (isDark === null) {
    // Avoid a mismatched icon flash before we can read the real state on mount
    return <span className="w-9 h-9 inline-block" aria-hidden />
  }

  return (
    <button
      type="button"
      onClick={toggle}
      title={isDark ? labelLight : labelDark}
      aria-label={isDark ? labelLight : labelDark}
      className="w-9 h-9 flex items-center justify-center rounded-lg border border-border text-foreground hover:bg-muted transition-colors"
    >
      {isDark ? '☀️' : '🌙'}
    </button>
  )
}
