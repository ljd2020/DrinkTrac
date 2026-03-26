import { useState } from 'react'
import DrinkEditor from '../components/drinks/DrinkEditor'
import { useDrinks } from '../hooks/useDrinks'
import { standardDrinks } from '../lib/alcohol-utils'
import type { CustomDrink } from '../db/schema'

export default function DrinksPage() {
  const { allDrinks, addCustomDrink, updateCustomDrink, deleteCustomDrink } = useDrinks()
  const [showEditor, setShowEditor] = useState(false)
  const [editingDrink, setEditingDrink] = useState<CustomDrink | null>(null)
  const [filter, setFilter] = useState<string>('all')

  const categories = ['all', 'beer', 'wine', 'spirit', 'cocktail', 'custom'] as const

  function handleSubmit(data: Omit<CustomDrink, 'id'>) {
    if (editingDrink) {
      updateCustomDrink(editingDrink.id, data)
    } else {
      addCustomDrink(data)
    }
    setShowEditor(false)
    setEditingDrink(null)
  }

  if (showEditor) {
    return (
      <div className="p-4 safe-area-top">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {editingDrink ? 'Edit Drink' : 'Create Custom Drink'}
        </h1>
        <DrinkEditor
          initial={editingDrink ?? undefined}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowEditor(false)
            setEditingDrink(null)
          }}
          submitLabel={editingDrink ? 'Update' : 'Create'}
        />
      </div>
    )
  }

  const filtered = filter === 'all'
    ? allDrinks
    : allDrinks.filter((d) => d.category === filter)

  return (
    <div className="p-4 safe-area-top space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Drink Library
        </h1>
        <button
          onClick={() => setShowEditor(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          + Custom
        </button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap capitalize transition-colors ${
              filter === cat
                ? 'bg-[var(--color-accent)] text-white'
                : 'bg-[var(--color-bg-card)] text-[var(--color-text-secondary)]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-2">
        {filtered.map((drink) => (
          <div
            key={`${drink.name}-${drink.id}`}
            className="flex items-center gap-3 bg-[var(--color-bg-card)] rounded-xl p-3"
          >
            <span className="text-2xl">{drink.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
                {drink.name}
              </p>
              <p className="text-xs text-[var(--color-text-secondary)]">
                {drink.volumeMl}ml &middot; {(drink.abv * 100).toFixed(1)}% &middot;{' '}
                {standardDrinks(drink.volumeMl, drink.abv).toFixed(1)} std
              </p>
            </div>
            {!drink.isDefault && (
              <div className="flex gap-1">
                <button
                  onClick={() => {
                    setEditingDrink(drink as CustomDrink)
                    setShowEditor(true)
                  }}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-accent)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931z" />
                  </svg>
                </button>
                <button
                  onClick={() => {
                    if (confirm(`Delete ${drink.name}?`)) {
                      deleteCustomDrink(drink.id!)
                    }
                  }}
                  className="p-2 text-[var(--color-text-secondary)] hover:text-[var(--color-bac-danger)]"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
