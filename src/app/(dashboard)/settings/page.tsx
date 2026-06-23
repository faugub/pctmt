import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getLocale } from '@/lib/i18n/getLocale'
import { dictionaries } from '@/lib/i18n/dictionaries'
import { updateBranding } from '@/app/actions/branding'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: coach } = await supabase
    .from('coaches')
    .select('brand_name, brand_logo_url, brand_primary_color')
    .eq('id', user.id)
    .single()

  const locale = await getLocale()
  const dict = dictionaries[locale]

  return (
    <main className="max-w-2xl mx-auto px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">{dict.settings.title}</h1>
      </div>

      <section className="bg-card border border-border rounded-2xl shadow-sm px-6 py-6 space-y-5">
        <div>
          <h2 className="text-base font-semibold text-foreground">{dict.settings.branding_title}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{dict.settings.branding_desc}</p>
        </div>

        <form action={updateBranding} className="space-y-4">
          <div>
            <label htmlFor="brand_name" className="block text-sm font-medium text-foreground mb-1">
              {dict.settings.brand_name}
            </label>
            <input
              id="brand_name"
              name="brand_name"
              type="text"
              defaultValue={coach?.brand_name ?? ''}
              placeholder={dict.settings.brand_name_placeholder}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="brand_logo_url" className="block text-sm font-medium text-foreground mb-1">
              {dict.settings.brand_logo}
            </label>
            <input
              id="brand_logo_url"
              name="brand_logo_url"
              type="url"
              defaultValue={coach?.brand_logo_url ?? ''}
              placeholder="https://..."
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label htmlFor="brand_primary_color" className="block text-sm font-medium text-foreground mb-1">
              {dict.settings.brand_color}
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brand_primary_color"
                name="brand_primary_color"
                type="color"
                defaultValue={coach?.brand_primary_color ?? '#16a34a'}
                className="h-10 w-14 rounded-lg border border-border bg-background cursor-pointer"
              />
              <span className="text-xs text-muted-foreground">{coach?.brand_primary_color ?? '#16a34a'}</span>
            </div>
          </div>

          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {dict.settings.save}
          </button>
        </form>
      </section>

      <section className="bg-card border border-border rounded-2xl shadow-sm px-6 py-6 space-y-2">
        <h2 className="text-base font-semibold text-foreground">{dict.settings.appearance_title}</h2>
        <p className="text-sm text-muted-foreground">{dict.settings.appearance_desc}</p>
        <p className="text-xs text-muted-foreground pt-2">{dict.settings.appearance_hint}</p>
      </section>
    </main>
  )
}
