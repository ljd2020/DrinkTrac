import { useState } from 'react'
import type { Profile } from '../../db/schema'

interface ProfileFormProps {
  initial?: Partial<Profile>
  onSubmit: (data: Omit<Profile, 'id' | 'createdAt' | 'isDefault'>) => void
  onCancel?: () => void
  submitLabel?: string
}

export default function ProfileForm({
  initial,
  onSubmit,
  onCancel,
  submitLabel = 'Save Profile',
}: ProfileFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [weightKg, setWeightKg] = useState(initial?.weightKg?.toString() ?? '')
  const [heightCm, setHeightCm] = useState(initial?.heightCm?.toString() ?? '')
  const [age, setAge] = useState(initial?.age?.toString() ?? '')
  const [sex, setSex] = useState<'male' | 'female'>(initial?.sex ?? 'male')
  const [drinkingFrequency, setDrinkingFrequency] = useState<Profile['drinkingFrequency']>(
    initial?.drinkingFrequency ?? 'occasionally',
  )
  const [useImperial, setUseImperial] = useState(() =>
    localStorage.getItem('useImperial') === 'true'
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const w = parseFloat(weightKg)
    const h = parseFloat(heightCm)
    const a = parseInt(age)
    if (!name || isNaN(w) || isNaN(h) || isNaN(a)) return

    onSubmit({
      name,
      weightKg: useImperial ? w * 0.453592 : w,
      heightCm: useImperial ? h * 2.54 : h,
      age: a,
      sex,
      drinkingFrequency,
    })
  }

  const inputClass =
    'w-full bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-3 py-2.5 text-[var(--color-text-primary)] focus:outline-none focus:border-[var(--color-accent)]'
  const labelClass = 'block text-sm text-[var(--color-text-secondary)] mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className={labelClass}>Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className={inputClass}
          placeholder="Your name"
          required
        />
      </div>

      <div className="flex items-center justify-end gap-2 text-sm">
        <span className={!useImperial ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}>
          Metric
        </span>
        <button
          type="button"
          onClick={() => {
            setUseImperial(!useImperial)
            localStorage.setItem('useImperial', (!useImperial).toString())
          }}
          className={`relative w-10 h-5 rounded-full transition-colors ${
            useImperial ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-card)]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform ${
              useImperial ? 'translate-x-5' : ''
            }`}
          />
        </button>
        <span className={useImperial ? 'text-[var(--color-accent)]' : 'text-[var(--color-text-secondary)]'}>
          Imperial
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>
            Weight ({useImperial ? 'lbs' : 'kg'})
          </label>
          <input
            type="number"
            value={weightKg}
            onChange={(e) => setWeightKg(e.target.value)}
            className={inputClass}
            placeholder={useImperial ? '180' : '82'}
            step="0.1"
            required
          />
        </div>
        <div>
          <label className={labelClass}>
            Height ({useImperial ? 'in' : 'cm'})
          </label>
          <input
            type="number"
            value={heightCm}
            onChange={(e) => setHeightCm(e.target.value)}
            className={inputClass}
            placeholder={useImperial ? '70' : '178'}
            step="0.1"
            required
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className={labelClass}>Age</label>
          <input
            type="number"
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className={inputClass}
            placeholder="30"
            min="18"
            max="120"
            required
          />
        </div>
        <div>
          <label className={labelClass}>Sex</label>
          <div className="flex gap-2">
            {(['male', 'female'] as const).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => setSex(s)}
                className={`flex-1 py-2.5 rounded-lg text-sm capitalize transition-colors ${
                  sex === s
                    ? 'bg-[var(--color-accent)] text-white'
                    : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] border border-[var(--color-bg-card)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div>
        <label className={labelClass}>Drinking Frequency</label>
        <select
          value={drinkingFrequency}
          onChange={(e) =>
            setDrinkingFrequency(e.target.value as Profile['drinkingFrequency'])
          }
          className={inputClass}
        >
          <option value="rarely">Rarely (once a month or less)</option>
          <option value="occasionally">Occasionally (few times a month)</option>
          <option value="regularly">Regularly (few times a week)</option>
          <option value="frequently">Frequently (daily)</option>
        </select>
      </div>

      <div className="flex gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] text-sm font-medium"
          >
            Cancel
          </button>
        )}
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
