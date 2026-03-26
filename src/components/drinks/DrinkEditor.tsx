import { useState } from 'react'
import type { CustomDrink } from '../../db/schema'

interface DrinkEditorProps {
  initial?: Partial<CustomDrink>
  onSubmit: (data: Omit<CustomDrink, 'id'>) => void
  onCancel: () => void
  submitLabel?: string
}

const ICONS = ['🍺', '🍻', '🍷', '🥂', '🥃', '🍸', '🍹', '🍾', '🧉', '🥤']

export default function DrinkEditor({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Drink',
}: DrinkEditorProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [volumeMl, setVolumeMl] = useState(initial?.volumeMl?.toString() ?? '')
  const [abvPct, setAbvPct] = useState(
    initial?.abv != null ? (initial.abv * 100).toString() : '',
  )
  const [icon, setIcon] = useState(initial?.icon ?? '🍺')
  const [category, setCategory] = useState<CustomDrink['category']>(
    initial?.category ?? 'custom',
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const vol = parseFloat(volumeMl)
    const abv = parseFloat(abvPct) / 100
    if (!name || isNaN(vol) || isNaN(abv) || vol <= 0 || abv <= 0 || abv > 1) return

    onSubmit({ name, volumeMl: vol, abv, icon, category })
  }

  const inputClass =
    'w-full bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-3 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]'
  const labelClass = 'block text-sm text-[var(--color-text-secondary)] mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Drink Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="e.g. My Special IPA"
          required
        />
      </div>

      <div>
        <label className={labelClass}>Icon</label>
        <div className="flex gap-2 flex-wrap">
          {ICONS.map((ic) => (
            <button
              key={ic}
              type="button"
              onClick={() => setIcon(ic)}
              className={`text-2xl p-1.5 rounded-lg transition-colors ${
                icon === ic
                  ? 'bg-[var(--color-accent)] ring-2 ring-[var(--color-accent)]'
                  : 'bg-[var(--color-bg-secondary)]'
              }`}
            >
              {ic}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Volume (mL)</label>
          <input
            type="number"
            value={volumeMl}
            onChange={(e) => setVolumeMl(e.target.value)}
            className={inputClass}
            placeholder="355"
            min="1"
            required
          />
        </div>
        <div>
          <label className={labelClass}>ABV (%)</label>
          <input
            type="number"
            value={abvPct}
            onChange={(e) => setAbvPct(e.target.value)}
            className={inputClass}
            placeholder="5.0"
            step="0.1"
            min="0.1"
            max="100"
            required
          />
        </div>
      </div>

      <div>
        <label className={labelClass}>Category</label>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as CustomDrink['category'])}
          className={inputClass}
        >
          <option value="beer">Beer</option>
          <option value="wine">Wine</option>
          <option value="spirit">Spirit</option>
          <option value="cocktail">Cocktail</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="flex-1 py-3 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
