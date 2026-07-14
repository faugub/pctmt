'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const PRIMARY = ['/dashboard', '/sessions', '/players', '/plans']

const ITEMS = [
  { href: '/dashboard', emoji: '🏠', label: 'Inicio'    },
  { href: '/sessions',  emoji: '📋', label: 'Sesiones'  },
  { href: '/players',   emoji: '🎾', label: 'Jugadores' },
  { href: '/plans',     emoji: '🗺️', label: 'Planes'    },
  { href: '/more',      emoji: '⊞',  label: 'Más'       },
]

export function BottomNav() {
  const pathname = usePathname()

  const isActive = (href: string) => {
    if (href === '/more') {
      return !PRIMARY.some(r => pathname === r || pathname.startsWith(r + '/'))
    }
    return pathname === href || pathname.startsWith(href + '/')
  }

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-card border-t border-border"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex items-center justify-around px-1 py-2">
        {ITEMS.map(item => {
          const active = isActive(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl min-w-[3rem] transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <span className={`text-xl leading-none transition-transform ${
                active ? 'scale-110' : ''
              }`}>
                {item.emoji}
              </span>
              <span className="text-[10px] font-medium leading-tight">
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
