'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export async function updateBranding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const brandName = (formData.get('brand_name') as string)?.trim() || null
  const brandLogoUrl = (formData.get('brand_logo_url') as string)?.trim() || null
  let brandColor = (formData.get('brand_primary_color') as string)?.trim() || '#16a34a'
  if (!HEX_RE.test(brandColor)) brandColor = '#16a34a'

  await supabase
    .from('coaches')
    .update({
      brand_name: brandName,
      brand_logo_url: brandLogoUrl,
      brand_primary_color: brandColor,
    })
    .eq('id', user.id)

  revalidatePath('/', 'layout')
}
