'use client'

import { useState } from 'react'

type Props = {
  /** Form field name — read server-side with formData.getAll(name). */
  name: string
  label: string
  options: readonly string[]
  defaultValue?: string[]
  helpText?: string
  /** Tailwind color for the active/selected chip state. Defaults to a neutral dark chip. */
  activeClassName?: string
}

/**
 * Chip multi-select for the tactical taxonomy (concept_tags / decision_tags).
 * Selected tags are submitted as repeated hidden <input name="..."> — the
 * same pattern already used for player_ids checkboxes elsewhere in the
 * app — so no client-side submit handling is needed; it's just part of
 * the surrounding <form>'s normal FormData.
 */
export function TaxonomyTagPicker({
  name,
  label,
  options,
  defaultValue = [],
  helpText,
  activeClassName = 'bg-gray-900 text-white border-gray-900',
}: Props) {
  const [selected, setSelected] = useState<string[]>(defaultValue)
  const [customInput, setCustomInput] = useState('')

  const toggle = (tag: string) => {
    setSelected((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  const addCustom = () => {
    const value = customInput.trim().toLowerCase()
    if (value && !selected.includes(value)) {
      setSelected((prev) => [...prev, value])
    }
    setCustomInput('')
  }

  // Tags the coach already had selected (e.g. typed previously) that aren't
  // in the seed list — keep them visible and removable, not silently dropped.
  const customSelected = selected.filter((t) => !options.includes(t))

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex flex-wrap gap-2 mb-2">
        {options.map((opt) => {
          const active = selected.includes(opt)
          return (
            <button
              key={opt}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                active ? activeClassName : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
              }`}
            >
              {opt}
            </button>
          )
        })}
        {customSelected.map((tag) => (
          <button
            key={tag}
            type="button"
            onClick={() => toggle(tag)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${activeClassName}`}
          >
            {tag} ×
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addCustom()
            }
          }}
          placeholder="Agregar otro..."
          className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <button
          type="button"
          onClick={addCustom}
          className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
        >
          Añadir
        </button>
      </div>

      {helpText && <p className="text-xs text-gray-400 mt-1">{helpText}</p>}

      {selected.map((tag) => (
        <input key={tag} type="hidden" name={name} value={tag} />
      ))}
    </div>
  )
}
