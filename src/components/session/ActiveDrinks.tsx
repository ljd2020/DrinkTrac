import { useState, useEffect } from 'react'
import type { SessionDrink } from '../../db/schema'

interface ActiveDrinksProps {
  drinks: SessionDrink[]
  onFinish: (id: number) => void
  onUpdateStartTime: (id: number, newTime: Date) => void
  onRemove: (id: number) => void
}

function ElapsedTime({ since }: { since: Date }) {
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 10000)
    return () => clearInterval(interval)
  }, [])

  const elapsed = Math.floor((Date.now() - new Date(since).getTime()) / 60000)
  if (elapsed < 1) return <span>just started</span>
  if (elapsed < 60) return <span>{elapsed}m</span>
  const h = Math.floor(elapsed / 60)
  const m = elapsed % 60
  return <span>{h}h {m}m</span>
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function toTimeInputValue(date: Date): string {
  const d = new Date(date)
  const h = d.getHours().toString().padStart(2, '0')
  const m = d.getMinutes().toString().padStart(2, '0')
  return `${h}:${m}`
}

export default function ActiveDrinks({
  drinks,
  onFinish,
  onUpdateStartTime,
  onRemove,
}: ActiveDrinksProps) {
  const [expandedId, setExpandedId] = useState<number | null>(null)

  if (drinks.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--color-text-secondary)]">
        <p className="text-4xl mb-2">🍺</p>
        <p className="text-sm">No drinks added yet</p>
        <p className="text-xs mt-1">Tap a drink below to start tracking</p>
      </div>
    )
  }

  const inProgress = drinks.filter((d) => !d.finishedAt)
  const finished = drinks.filter((d) => d.finishedAt)

  return (
    <div className="space-y-2">
      {inProgress.length > 0 && (
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)]">
          Now Drinking ({inProgress.length})
        </h3>
      )}

      {inProgress.map((drink) => (
        <DrinkCard
          key={drink.id}
          drink={drink}
          isExpanded={expandedId === drink.id}
          onToggle={() => setExpandedId(expandedId === drink.id ? null : drink.id)}
          onFinish={onFinish}
          onUpdateStartTime={onUpdateStartTime}
          onRemove={onRemove}
        />
      ))}

      {finished.length > 0 && (
        <h3 className="text-sm font-medium text-[var(--color-text-secondary)] mt-3">
          Finished ({finished.length})
        </h3>
      )}

      {finished.map((drink) => (
        <DrinkCard
          key={drink.id}
          drink={drink}
          isExpanded={expandedId === drink.id}
          onToggle={() => setExpandedId(expandedId === drink.id ? null : drink.id)}
          onFinish={onFinish}
          onUpdateStartTime={onUpdateStartTime}
          onRemove={onRemove}
        />
      ))}
    </div>
  )
}

function DrinkCard({
  drink,
  isExpanded,
  onToggle,
  onFinish,
  onUpdateStartTime,
  onRemove,
}: {
  drink: SessionDrink
  isExpanded: boolean
  onToggle: () => void
  onFinish: (id: number) => void
  onUpdateStartTime: (id: number, newTime: Date) => void
  onRemove: (id: number) => void
}) {
  const isActive = !drink.finishedAt

  function handleTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newTime = new Date(drink.timestamp)
    newTime.setHours(hours, minutes, 0, 0)
    onUpdateStartTime(drink.id, newTime)
  }

  return (
    <div
      className={`bg-[var(--color-bg-card)] rounded-xl overflow-hidden transition-all ${
        isActive ? 'ring-1 ring-[var(--color-bac-safe)]/40' : ''
      }`}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 p-3 text-left"
      >
        <span className="text-xl relative">
          {drink.icon}
          {isActive && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--color-bac-safe)] rounded-full animate-pulse" />
          )}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-[var(--color-text-primary)] truncate">
            {drink.drinkName}
          </p>
          <p className="text-xs text-[var(--color-text-secondary)]">
            {isActive ? (
              <>
                Started {formatTime(drink.timestamp)} &middot;{' '}
                <span className="text-[var(--color-bac-safe)]">
                  Drinking <ElapsedTime since={drink.timestamp} />
                </span>
              </>
            ) : (
              <>
                {formatTime(drink.timestamp)} &middot;{' '}
                {drink.durationMinutes}m &middot;{' '}
                {drink.volumeMl}ml &middot;{' '}
                {(drink.abv * 100).toFixed(1)}%
              </>
            )}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-[var(--color-text-secondary)] transition-transform ${
            isExpanded ? 'rotate-180' : ''
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-2">
          {isActive && (
            <button
              onClick={() => { onFinish(drink.id); onToggle() }}
              className="w-full py-2.5 rounded-lg bg-[var(--color-bac-safe)]/20 text-[var(--color-bac-safe)] text-sm font-medium"
            >
              Finish Now
            </button>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-secondary)]">Started:</label>
            <input
              type="time"
              value={toTimeInputValue(drink.timestamp)}
              onChange={handleTimeChange}
              className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text-primary)]"
            />
          </div>

          <button
            onClick={() => { onRemove(drink.id); onToggle() }}
            className="w-full py-2 rounded-lg bg-[var(--color-bac-danger)]/10 text-[var(--color-bac-danger)] text-sm"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  )
}
