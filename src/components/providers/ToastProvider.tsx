'use client'

import { createContext, useCallback, useContext, useRef, useState } from 'react'

export type ToastVariant = 'success' | 'error' | 'info'

export type ToastAction = {
  label: string
  onClick: () => void
}

export type ToastOptions = {
  title?: string
  description: string
  variant?: ToastVariant
  /** ms before auto-dismiss. Set 0 to require manual/action dismissal. */
  duration?: number
  action?: ToastAction
}

type ToastRecord = ToastOptions & { id: string }

type ToastContextValue = {
  toast: (options: ToastOptions) => string
  dismiss: (id: string) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

const DEFAULT_DURATION = 5000

const VARIANT_STYLES: Record<ToastVariant, string> = {
  success: 'border-success/30 bg-success/10',
  error: 'border-danger/30 bg-danger/10',
  info: 'border-border bg-card',
}

const VARIANT_DOT: Record<ToastVariant, string> = {
  success: 'bg-success',
  error: 'bg-danger',
  info: 'bg-primary',
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastRecord[]>([])
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    const timer = timers.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timers.current.delete(id)
    }
  }, [])

  const toast = useCallback(
    (options: ToastOptions) => {
      const id = crypto.randomUUID()
      const duration = options.duration ?? DEFAULT_DURATION
      setToasts((prev) => [...prev, { ...options, id }])

      if (duration > 0) {
        const timer = setTimeout(() => dismiss(id), duration)
        timers.current.set(id, timer)
      }

      return id
    },
    [dismiss]
  )

  return (
    <ToastContext.Provider value={{ toast, dismiss }}>
      {children}

      {/* Toaster — fixed, mobile-first (full-width bottom sheet on small screens) */}
      <div
        className="fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:items-end"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            role="status"
            className={`w-full sm:w-auto sm:min-w-[320px] sm:max-w-sm rounded-xl border shadow-lg px-4 py-3 flex items-start gap-3 ${VARIANT_STYLES[t.variant ?? 'info']}`}
          >
            <span className={`mt-1.5 h-2 w-2 rounded-full shrink-0 ${VARIANT_DOT[t.variant ?? 'info']}`} aria-hidden />
            <div className="flex-1 min-w-0">
              {t.title && <p className="text-sm font-medium text-foreground">{t.title}</p>}
              <p className="text-sm text-muted-foreground">{t.description}</p>
            </div>
            {t.action && (
              <button
                type="button"
                onClick={() => {
                  t.action!.onClick()
                  dismiss(t.id)
                }}
                className="text-sm font-medium text-foreground underline shrink-0"
              >
                {t.action.label}
              </button>
            )}
            <button
              type="button"
              onClick={() => dismiss(t.id)}
              aria-label="Cerrar"
              className="text-muted-foreground hover:text-foreground shrink-0 leading-none text-base"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}
