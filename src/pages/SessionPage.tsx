import { useState } from 'react'
import DrinkPicker from '../components/session/DrinkPicker'
import ActiveDrinks from '../components/session/ActiveDrinks'
import { useProfiles } from '../hooks/useProfiles'
import { useSession } from '../hooks/useSession'
import { useDrinks } from '../hooks/useDrinks'

type StomachContent = 'empty' | 'light' | 'moderate' | 'full'

export default function SessionPage() {
  const { defaultProfile } = useProfiles()
  const {
    sessionDrinks,
    addSessionDrink,
    updateSessionDrink,
    finishDrink,
    removeSessionDrink,
    clearSession,
  } = useSession(defaultProfile?.id)
  const { customDrinks } = useDrinks()
  const [stomachContent, setStomachContent] = useState<StomachContent>('light')

  if (!defaultProfile) {
    return (
      <div className="p-4 safe-area-top text-center py-16">
        <p className="text-[var(--color-text-secondary)]">
          Create a profile first to start adding drinks
        </p>
      </div>
    )
  }

  function handleSelectDrink(drink: {
    name: string
    volumeMl: number
    abv: number
    icon: string
    defaultDurationMinutes: number
  }) {
    addSessionDrink({
      profileId: defaultProfile!.id,
      drinkName: drink.name,
      volumeMl: drink.volumeMl,
      abv: drink.abv,
      icon: drink.icon,
      timestamp: new Date(),
      durationMinutes: drink.defaultDurationMinutes,
      finishedAt: null,
      stomachContent,
    })
  }

  function handleUpdateStartTime(id: number, newTime: Date) {
    updateSessionDrink(id, { timestamp: newTime })
  }

  const stomachOptions: { value: StomachContent; label: string }[] = [
    { value: 'empty', label: 'Empty' },
    { value: 'light', label: 'Light' },
    { value: 'moderate', label: 'Moderate' },
    { value: 'full', label: 'Full' },
  ]

  return (
    <div className="p-4 safe-area-top space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Add Drinks
        </h1>
        {sessionDrinks.length > 0 && (
          <button
            onClick={clearSession}
            className="text-sm text-[var(--color-bac-danger)]"
          >
            Clear All
          </button>
        )}
      </div>

      {/* Stomach content selector */}
      <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
        <label className="text-sm text-[var(--color-text-secondary)] block mb-1.5">
          Stomach Content
        </label>
        <div className="flex gap-2">
          {stomachOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStomachContent(opt.value)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-colors ${
                stomachContent === opt.value
                  ? 'bg-[var(--color-accent)] text-white'
                  : 'bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      <ActiveDrinks
        drinks={sessionDrinks}
        onFinish={finishDrink}
        onUpdateStartTime={handleUpdateStartTime}
        onRemove={removeSessionDrink}
      />

      <DrinkPicker customDrinks={customDrinks} onSelect={handleSelectDrink} />
    </div>
  )
}
