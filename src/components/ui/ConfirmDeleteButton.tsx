'use client'

import { useEffect, useRef, useState } from 'react'
import { useToast } from '@/components/providers/ToastProvider'

type Props = {
  /** The actual delete call — typically a Server Action bound to an id, e.g. `() => deletePlayer(id)`. */
  onConfirm: () => Promise<void>
  /** Button label, e.g. "Eliminar jugador". */
  label: string
  /** Toast copy while the undo window is open, e.g. "María se eliminará". */
  pendingMessage: string
  /** How long the coach has to hit "Deshacer" before the delete actually runs. */
  undoWindowMs?: number
  className?: string
  /** Forces the button disabled regardless of its own pending state — e.g. a sibling destructive action is already armed. */
  disabled?: boolean
  /** Fires with `true` when this button arms its undo window, `false` when it cancels/settles. Lets a parent disable sibling destructive actions while one is pending. */
  onPendingChange?: (pending: boolean) => void
}

const DEFAULT_UNDO_WINDOW_MS = 5000

/**
 * Next.js Server Actions that call redirect() throw a special error with
 * digest 'NEXT_REDIRECT' — that's the framework's mechanism for navigating
 * after a direct (non-<form>) action call, not a real failure. We must let
 * it propagate instead of swallowing it as an error toast.
 */
function isRedirectSignal(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'digest' in err && String((err as { digest?: unknown }).digest).startsWith('NEXT_REDIRECT')
}

/**
 * Replaces the old window.confirm() destructive-action pattern with an
 * undo window: clicking the button schedules the delete instead of running
 * it immediately, and shows a toast with a "Deshacer" action that cancels
 * it. Nothing is removed from the list until the window elapses.
 */
export function ConfirmDeleteButton({
  onConfirm,
  label,
  pendingMessage,
  undoWindowMs = DEFAULT_UNDO_WINDOW_MS,
  className,
  disabled = false,
  onPendingChange,
}: Props) {
  const { toast, dismiss } = useToast()
  const [pending, setPending] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const toastIdRef = useRef<string | null>(null)

  const setPendingState = (value: boolean) => {
    setPending(value)
    onPendingChange?.(value)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
    setPendingState(false)
  }

  const handleClick = () => {
    setPendingState(true)

    timerRef.current = setTimeout(async () => {
      try {
        await onConfirm()
      } catch (err) {
        // Next.js handles navigation as a side effect of the call above;
        // if it also rethrows the redirect signal to us, just let it be —
        // there's nothing useful to do with it here.
        if (isRedirectSignal(err)) return
        setPendingState(false)
        if (toastIdRef.current) dismiss(toastIdRef.current)
        toast({
          description: 'No se pudo eliminar. Probá de nuevo.',
          variant: 'error',
        })
      }
    }, undoWindowMs)

    toastIdRef.current = toast({
      description: pendingMessage,
      variant: 'info',
      duration: undoWindowMs,
      action: { label: 'Deshacer', onClick: cancel },
    })
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending || disabled}
      className={
        className ??
        'w-full py-2.5 text-sm text-red-500 border border-red-100 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
      }
    >
      {pending ? 'Eliminando…' : label}
    </button>
  )
}
