import { useState } from 'react'
import { DEFAULT_DRINKS, type DefaultDrink } from '../../lib/constants'
import type { CustomDrink } from '../../db/schema'
import { standardDrinks } from '../../lib/alcohol-utils'

type DrinkItem = (DefaultDrink | (CustomDrink & { isDefault?: boolean })) & {
  id?: number
}

interface DrinkPickerProps {
  customDrinks: CustomDrink[]
  onSelect: (drink: {
    name: string
    volumeMl: number
    abv: number
    icon: string
  }) => void
}

const categories = [
  { key: 'all', label: 'All' },
  { key: 'beer', label: 'Beer' },
  { key: 'wine', label: 'Wine' },
  { key: 'spirit', label: 'Spirits' },
  { key: 'cocktail', label: 'Cocktails' },
  { key: 'custom', label: 'Custom' },
] as const

export default function DrinkPicker({ customDrinks, onSelect }: DrinkPickerProps) {
  const [category, setCategory] = useState<string>('all')

  const allDrinks: DrinkItem[] = [
    ...DEFAULT_DRINKS,
    ...customDrinks,
  ]

  const filtered = category === 'all'
    ? allDrinks
    : allDrinks.filter((d) => d.category === category)

  return (
    <div>
      {/* Category pills */}
      <div className="flex gap-2 overflow-x-auto pb-3 px-4 -mx-4 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-colors ${
              category === cat.key
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Drink grid */}
      <div className="grid grid-cols-2 gap-3 mt-3">
        {filtered.map((drink, i) => (
          <button
            key={`${drink.name}-${i}`}
            onClick={() =>
              onSelect({
                name: drink.name,
                volumeMl: drink.volumeMl,
                abv: drink.abv,
                icon: drink.icon,
              })
            }
            className="bg-[var(--color-bg-card)] rounded-xl p-3 text-left hover:bg-[var(--color-bg-secondary)] transition-colors active:scale-95"
          >
            <span className="text-2xl">{drink.icon}</span>
            <p className="text-sm font-medium text-[var(--color-text-primary)] mt-1 truncate">
              {drink.name}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {drink.volumeMl}ml &middot; {(drink.abv * 100).toFixed(1)}%
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {standardDrinks(drink.volumeMl, drink.abv).toFixed(1)} std drinks
            </p>
          </button>
        ))}
      </div>
    </div>
  )
}
