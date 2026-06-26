'use client'

import { TaxonomyTagPicker } from '@/components/ui/TaxonomyTagPicker'
import { CONCEPT_TAGS, DECISION_TAGS } from '@/lib/taxonomy'

const BLOCK_TYPES = [
  { value: 'warmup',    label: 'Calentamiento' },
  { value: 'technique', label: 'Técnica' },
  { value: 'physical',  label: 'Físico' },
  { value: 'tactical',  label: 'Táctico' },
  { value: 'match',     label: 'Partido' },
  { value: 'cooldown',  label: 'Vuelta a la calma' },
]

type StrategyOption = { id: string; title: string }

type DefaultValues = {
  title?: string
  block_type?: string
  description?: string | null
  duration_min?: number | null
  tags?: string[] | null
  strategy_id?: string | null
  concept_tags?: string[] | null
  decision_tags?: string[] | null
}

export function BlockForm({
  action,
  strategies,
  defaultValues = {},
  submitLabel = 'Guardar',
}: {
  action: (formData: FormData) => Promise<void>
  strategies: StrategyOption[]
  defaultValues?: DefaultValues
  submitLabel?: string
}) {
  const tagsDefault = defaultValues.tags?.join(', ') ?? ''

  return (
    <form action={action} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Título <span className="text-red-500">*</span>
        </label>
        <input
          name="title"
          type="text"
          required
          defaultValue={defaultValues.title ?? ''}
          placeholder="Ej. Calentamiento articular"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Tipo de bloque <span className="text-red-500">*</span>
        </label>
        <select
          name="block_type"
          required
          defaultValue={defaultValues.block_type ?? ''}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="" disabled>Selecciona un tipo</option>
          {BLOCK_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Duración (minutos)</label>
        <input
          name="duration_min"
          type="number"
          min={1}
          defaultValue={defaultValues.duration_min ?? ''}
          placeholder="15"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
        <textarea
          name="description"
          rows={4}
          defaultValue={defaultValues.description ?? ''}
          placeholder="Describe el ejercicio, objetivos, organización en pista..."
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 resize-none"
        />
      </div>

      <TaxonomyTagPicker
        name="concept_tags"
        label="Concepto táctico"
        options={CONCEPT_TAGS}
        defaultValue={defaultValues.concept_tags ?? []}
        activeClassName="bg-amber-600 text-white border-amber-600"
        helpText="¿Qué concepto entrena este bloque? Esto es lo que después te permite ver cuánto venís trabajando cada cosa con un jugador."
      />

      <TaxonomyTagPicker
        name="decision_tags"
        label="Tipo de decisión"
        options={DECISION_TAGS}
        defaultValue={defaultValues.decision_tags ?? []}
        activeClassName="bg-purple-600 text-white border-purple-600"
      />

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Vincular a una estrategia</label>
        <select
          name="strategy_id"
          defaultValue={defaultValues.strategy_id ?? ''}
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 bg-white"
        >
          <option value="">— Ninguna —</option>
          {strategies.map((s) => (
            <option key={s.id} value={s.id}>{s.title}</option>
          ))}
        </select>
        <p className="text-xs text-gray-400 mt-1">Opcional. Conecta este bloque con una jugada de tu biblioteca de estrategias.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Etiquetas</label>
        <input
          name="tags"
          type="text"
          defaultValue={tagsDefault}
          placeholder="volea, red, reacción — separadas por coma"
          className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
        <p className="text-xs text-gray-400 mt-1">Separa las etiquetas con comas</p>
      </div>

      <div className="pt-2">
        <button
          type="submit"
          className="w-full py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
