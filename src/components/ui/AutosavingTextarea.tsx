'use client'

import { useEffect, useRef, useState } from 'react'

type Props = {
  name: string
  label: string
  /** Unique per field, e.g. `session:${id}:notes` or `session:new:notes`. */
  draftKey: string
  defaultValue?: string
  placeholder?: string
  rows?: number
}

/**
 * A textarea that survives losing connection or closing the tab mid-write.
 * Every change is debounced into localStorage under `draftKey`. On mount,
 * if a stored draft differs from what the server has, we show it instead
 * of the server value and let the coach discard it explicitly — it's
 * either unsent work from a previous visit, or a submit that failed
 * silently while offline. Once a submit actually succeeds, the server
 * value will match the draft on next load and we drop it automatically.
 *
 * This is intentionally just local persistence, not a sync queue: no
 * service worker, no background retry. That's a deliberate scope cut —
 * Phase 7 (PWA) is frozen, and a full offline queue belongs there, not
 * bolted onto a single form field.
 */
export function AutosavingTextarea({ name, label, draftKey, defaultValue = '', placeholder, rows = 2 }: Props) {
  const storageKey = `pctmt-draft:${draftKey}`
  const [value, setValue] = useState(defaultValue)
  const [restored, setRestored] = useState(false)
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    let draft: string | null = null
    try {
      draft = localStorage.getItem(storageKey)
    } catch {
      // Private mode / storage disabled — no offline safety net, but the
      // form still works exactly like a plain textarea.
    }

    if (draft === null) return

    if (draft === defaultValue) {
      // The server already has this value — the draft served its purpose.
      try { localStorage.removeItem(storageKey) } catch {}
      return
    }

    setValue(draft)
    setRestored(true)
    // Only meant to run once, right after mount, for this field's key.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey])

  useEffect(() => {
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current)
    }
  }, [])

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const next = e.target.value
    setValue(next)

    if (saveTimer.current) clearTimeout(saveTimer.current)
    saveTimer.current = setTimeout(() => {
      try {
        if (next === defaultValue) {
          localStorage.removeItem(storageKey)
        } else {
          localStorage.setItem(storageKey, next)
        }
      } catch {
        // Ignore — same private-mode fallback as above.
      }
    }, 400)
  }

  const discardDraft = () => {
    try { localStorage.removeItem(storageKey) } catch {}
    setValue(defaultValue)
    setRestored(false)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label className="block text-sm font-medium text-gray-700">{label}</label>
        {restored && (
          <button
            type="button"
            onClick={discardDraft}
            className="text-xs text-amber-600 hover:underline"
          >
            Descartar borrador local
          </button>
        )}
      </div>
      {restored && (
        <p className="text-xs text-amber-600 mb-1">
          📝 Recuperado de un guardado local — parece que no se llegó a enviar.
        </p>
      )}
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
      />
    </div>
  )
}
