'use client'

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type Props = {
  dict: Dictionary
  brandLabel: string
}

export function MobileNav({ dict, brandLabel }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={dict.nav.dashboard}
        className="md:hidden w-9 h-9 flex items-center justify-center rounded-lg border border-border text-foreground"
      >
        ☰
      </button>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/40" onClick={() => setOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-card border-r border-border flex flex-col">
            <div className="flex items-center justify-between px-4 py-4 border-b border-border">
              <span className="font-semibold text-foreground tracking-tight">{brandLabel}</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
                className="text-muted-foreground"
              >
                ✕
              </button>
            </div>
            <Sidebar dict={dict} onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}
    </>
  )
}
