'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { Dictionary } from '@/lib/i18n/dictionaries'

type NavItem = { href: string; label: string; emoji: string }
type NavGroup = { label: string; items: NavItem[] }

type Props = {
  dict: Dictionary
  onNavigate?: () => void
}

export function Sidebar({ dict, onNavigate }: Props) {
  const pathname = usePathname()

  const groups: NavGroup[] = [
    {
      label: dict.nav.group_main,
      items: [
        { href: '/dashboard', label: dict.nav.dashboard, emoji: '🏠' },
        { href: '/calendar', label: dict.nav.calendar, emoji: '📅' },
      ],
    },
    {
      label: dict.nav.group_players,
      items: [
        { href: '/players', label: dict.nav.players, emoji: '🎾' },
      ],
    },
    {
      label: dict.nav.group_training,
      items: [
        { href: '/sessions', label: dict.nav.sessions, emoji: '📋' },
        { href: '/series', label: dict.nav.series, emoji: '🔁' },
        { href: '/blocks', label: dict.nav.blocks, emoji: '🏃' },
        { href: '/plans', label: dict.nav.plans, emoji: '🗺️' },
      ],
    },
    {
      label: dict.nav.group_strategy,
      items: [
        { href: '/strategies', label: dict.nav.strategies, emoji: '🧠' },
        { href: '/boards', label: dict.nav.boards, emoji: '🖊️' },
      ],
    },
    {
      label: dict.nav.group_competition,
      items: [
        { href: '/tournaments', label: dict.nav.tournaments, emoji: '🏆' },
      ],
    },
  ]

  const isActive = (href: string) => pathname === href || pathname.startsWith(href + '/')

  return (
    <nav className="flex flex-col gap-5 px-3 py-4 overflow-y-auto h-full">
      {groups.map((group) => (
        <div key={group.label}>
          <p className="px-3 mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            {group.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
                  isActive(item.href)
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <span className="text-base">{item.emoji}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      ))}

      <div className="mt-auto pt-2 border-t border-border">
        <Link
          href="/settings"
          onClick={onNavigate}
          className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition-colors ${
            isActive('/settings')
              ? 'bg-primary text-primary-foreground font-medium'
              : 'text-foreground hover:bg-muted'
          }`}
        >
          <span className="text-base">⚙️</span>
          {dict.nav.settings}
        </Link>
      </div>
    </nav>
  )
}
