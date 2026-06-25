import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionaries } from '@/lib/i18n/dictionaries'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { ToastListener } from '@/components/ui/ToastListener'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coach } = await supabase
    .from('coaches')
    .select('full_name, brand_name, brand_logo_url, brand_primary_color')
    .eq('id', user.id)
    .single()

  const locale = await getLocale()
  const dict = dictionaries[locale]

  const brandLabel = coach?.brand_name?.trim() || 'pctmt'
  const brandColor = coach?.brand_primary_color || '#16a34a'
  const brandLogoUrl = coach?.brand_logo_url ?? null

  return (
    <div
      className="min-h-screen bg-background text-foreground"
      style={{ '--primary': brandColor } as React.CSSProperties}
    >
      <aside className="hidden md:flex md:w-64 md:flex-col border-r border-border bg-card md:fixed md:inset-y-0">
        <div className="flex items-center gap-2 px-4 py-4 border-b border-border">
          {brandLogoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={brandLogoUrl} alt={brandLabel} className="h-6 w-auto" />
          ) : null}
          <span className="font-semibold text-foreground tracking-tight">{brandLabel}</span>
        </div>
        <Sidebar dict={dict} />
      </aside>

      <div className="md:ml-64 flex flex-col min-h-screen">
        <TopBar
          dict={dict}
          locale={locale}
          brandLabel={brandLabel}
          brandLogoUrl={brandLogoUrl}
          displayName={coach?.full_name ?? user.email ?? ''}
        />
        <Suspense fallback={null}>
          <ToastListener />
        </Suspense>
        <main className="flex-1">{children}</main>
      </div>
    </div>
  )
}
