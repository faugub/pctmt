'use client'

import { useEffect } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/components/providers/ToastProvider'
import type { ToastVariant } from '@/components/providers/ToastProvider'

/**
 * Bridges server-side redirects to the toast system. A Server Action can
 * redirect to e.g. `/players?notice=Jugador+creado&notice_variant=success`
 * and this component (mounted once in the dashboard layout) will surface
 * the toast on arrival, then strip the params so a refresh or back/forward
 * navigation doesn't re-fire it.
 */
export function ToastListener() {
  const { toast } = useToast()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const notice = searchParams.get('notice')
  const variant = (searchParams.get('notice_variant') as ToastVariant | null) ?? 'success'

  useEffect(() => {
    if (!notice) return

    toast({ description: notice, variant })

    const params = new URLSearchParams(searchParams.toString())
    params.delete('notice')
    params.delete('notice_variant')
    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notice])

  return null
}
