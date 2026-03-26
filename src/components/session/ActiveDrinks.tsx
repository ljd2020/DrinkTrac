import type { SessionDrink } from '../../db/schema'

interface ActiveDrinksProps {
  drinks: SessionDrink[]
  onRemove: (id: number) => void
}

export default function ActiveDrinks({ drinks, onRemove }: ActiveDrinksProps) {
  if (drinks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-secondary)]">
        <p className="text-4xl mb-2">🍺</p>
        <p className="text-sm">No drinks added yet</p>
        <p className="text-xs mt-1">Tap a drink below to start tracking</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Active Drinks ({drinks.length})
        </h3>
      </div>
      {drinks.map((drink) => (
        <div
          key={drink.id}
          className="flex items-center gap-3 bg-[var(--color-bg-card)] rounded-xl p-3"
        >
          <span className="text-xl">{drink.icon}</span>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
              {drink.drinkName}
            </p>
            <p className="text-xs text-[var(--color-text-secondary)]">
              {new Date(drink.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
              {' \u00B7 '}
              {drink.volumeMl}ml {' \u00B7 '}
              {(drink.abv * 100).toFixed(1)}%
            </p>
          </div>
          <button
            onClick={() => onRemove(drink.id)}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-bac-danger)] transition-colors p-1"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  )
}
