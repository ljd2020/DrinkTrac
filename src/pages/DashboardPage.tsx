import { useState, useEffect } from 'react'
import BACDisplay from '../components/dashboard/BACDisplay'
import BACGraph from '../components/dashboard/BACGraph'
import SobrietyTimer from '../components/dashboard/SobrietyTimer'
import BACAlarm from '../components/dashboard/BACAlarm'
import { useProfiles } from '../hooks/useProfiles'
import { useSession } from '../hooks/useSession'
import { useBACCalculation } from '../hooks/useBACCalculation'
import { formatBAC, formatDuration } from '../lib/alcohol-utils'

export default function DashboardPage() {
  const { defaultProfile } = useProfiles()
  const { sessionDrinks } = useSession(defaultProfile?.id)
  const { timeSeries, currentBAC, timeToSober, peakBAC } = useBACCalculation(
    defaultProfile,
    sessionDrinks,
  )

  // Re-render every 30 seconds to update current BAC from time series
  const [, setTick] = useState(0)
  useEffect(() => {
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [])

  if (!defaultProfile) {
    return (
      <div className="p-4 safe-area-top">
        <div className="text-center py-16">
          <p className="text-5xl mb-4">🍺</p>
          <h1 className="text-2xl font-bold text-[var(--color-text-primary)] mb-2">
            Welcome to DrinkTrac
          </h1>
          <p className="text-[var(--color-text-secondary)] mb-6">
            Create a profile to start tracking your BAC
          </p>
          <a
            href="/profile"
            className="inline-block px-6 py-3 rounded-xl bg-[var(--color-accent)] text-white font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            Create Profile
          </a>
        </div>

        <div className="mt-8 bg-[var(--color-bg-card)] rounded-xl p-4">
          <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
            <strong>Disclaimer:</strong> DrinkTrac provides BAC estimates for educational
            purposes only. Actual BAC varies based on many factors not modeled here.
            Never use this app to determine if you are safe to drive. If you have
            consumed alcohol, do not drive.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 safe-area-top space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          DrinkTrac
        </h1>
        <span className="text-sm text-[var(--color-text-secondary)]">
          {defaultProfile.name}
        </span>
      </div>

      <BACDisplay bac={currentBAC} />

      <div className="grid grid-cols-2 gap-3">
        <SobrietyTimer minutesToSober={timeToSober} />
        <div className="bg-[var(--color-bg-card)] rounded-xl p-4 text-center">
          <p className="text-sm text-[var(--color-text-secondary)]">Peak BAC</p>
          <p className="text-2xl font-semibold text-[var(--color-text-primary)] mt-1">
            {peakBAC ? formatBAC(peakBAC.bac) : '0.000'}
          </p>
        </div>
      </div>

      <BACGraph points={timeSeries} />

      <BACAlarm currentBAC={currentBAC} />

      <div className="text-center pt-2">
        <p className="text-xs text-[var(--color-text-secondary)]">
          {sessionDrinks.length} drink{sessionDrinks.length !== 1 ? 's' : ''} tracked
          {timeToSober > 0 && ` \u00B7 Sober in ~${formatDuration(timeToSober)}`}
        </p>
      </div>
    </div>
  )
}
