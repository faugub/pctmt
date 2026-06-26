import Link from 'next/link'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher'
import { MobileNav } from './MobileNav'
import { logout } from '@/app/actions/auth'
import type { Dictionary, Locale } from '@/lib/i18n/dictionaries'

type Props = {
  dict: Dictionary
  locale: Locale
  brandLabel: string
  brandLogoUrl: string | null
  displayName: string
}

export function TopBar({ dict, locale, brandLabel, brandLogoUrl, displayName }: Props) {
  return (
    <header className="sticky top-0 z-30 bg-card border-b border-border px-4 md:px-6 py-3 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <MobileNav dict={dict} brandLabel={brandLabel} />
        <div className="hidden md:flex items-center gap-2">
          {brandLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandLogoUrl} alt={brandLabel} className="h-6 w-auto" />
          ) : null}
          <span className="font-semibold text-foreground tracking-tight">{brandLabel}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link
          href="/search"
          aria-label={dict.header.search}
          title={dict.header.search}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <span className="text-lg" aria-hidden>🔎</span>
        </Link>
        <LanguageSwitcher locale={locale} label={dict.header.language} />
        <ThemeToggle labelLight={dict.header.theme_light} labelDark={dict.header.theme_dark} />
        <span className="hidden sm:inline text-sm text-muted-foreground px-1">{displayName}</span>
        <form action={logout}>
          <button
            type="submit"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors px-2"
          >
            {dict.header.logout}
          </button>
        </form>
      </div>
    </header>
  )
}
