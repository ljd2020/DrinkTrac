import { useState, useEffect } from 'react'
import type { SessionDrink } from '../../db/schema'

interface ActiveDrinksProps {
  drinks: SessionDrink[]
  onFinish: (id: number) => void
  onUpdateDrink: (id: number, data: Partial<SessionDrink>) => void
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
  onUpdateDrink,
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
          onUpdateDrink={onUpdateDrink}
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
          onUpdateDrink={onUpdateDrink}
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
  onUpdateDrink,
  onRemove,
}: {
  drink: SessionDrink
  isExpanded: boolean
  onToggle: () => void
  onFinish: (id: number) => void
  onUpdateDrink: (id: number, data: Partial<SessionDrink>) => void
  onRemove: (id: number) => void
}) {
  const isActive = !drink.finishedAt

  function handleStartTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newStart = new Date(drink.timestamp)
    newStart.setHours(hours, minutes, 0, 0)
    if (drink.finishedAt) {
      const duration = Math.max(1, Math.round((new Date(drink.finishedAt).getTime() - newStart.getTime()) / 60000))
      onUpdateDrink(drink.id, { timestamp: newStart, durationMinutes: duration })
    } else {
      onUpdateDrink(drink.id, { timestamp: newStart })
    }
  }

  function handleEndTimeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const [hours, minutes] = e.target.value.split(':').map(Number)
    const newEnd = new Date(drink.finishedAt ?? drink.timestamp)
    newEnd.setHours(hours, minutes, 0, 0)
    const duration = Math.max(1, Math.round((newEnd.getTime() - new Date(drink.timestamp).getTime()) / 60000))
    onUpdateDrink(drink.id, { finishedAt: newEnd, durationMinutes: duration })
  }

  function handleDurationChange(e: React.ChangeEvent<HTMLInputElement>) {
    const mins = parseInt(e.target.value)
    if (isNaN(mins) || mins < 1) return
    if (drink.finishedAt) {
      const newEnd = new Date(new Date(drink.timestamp).getTime() + mins * 60000)
      onUpdateDrink(drink.id, { durationMinutes: mins, finishedAt: newEnd })
    } else {
      onUpdateDrink(drink.id, { durationMinutes: mins })
    }
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
            <label className="text-xs text-[var(--color-text-secondary)] w-16">Started:</label>
            <input
              type="time"
              value={toTimeInputValue(drink.timestamp)}
              onChange={handleStartTimeChange}
              className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text-primary)]"
            />
          </div>

          {!isActive && drink.finishedAt && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-[var(--color-text-secondary)] w-16">Finished:</label>
              <input
                type="time"
                value={toTimeInputValue(drink.finishedAt)}
                onChange={handleEndTimeChange}
                className="flex-1 bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text-primary)]"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-text-secondary)] w-16">Duration:</label>
            <div className="flex items-center gap-1.5 flex-1">
              <input
                type="number"
                value={drink.durationMinutes}
                onChange={handleDurationChange}
                min="1"
                max="480"
                className="w-20 bg-[var(--color-bg-secondary)] border border-[var(--color-bg-card)] rounded-lg px-2 py-1.5 text-sm text-[var(--color-text-primary)]"
              />
              <span className="text-xs text-[var(--color-text-secondary)]">min</span>
            </div>
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
