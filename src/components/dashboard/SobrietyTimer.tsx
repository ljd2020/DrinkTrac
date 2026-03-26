import { formatDuration } from '../../lib/alcohol-utils'

interface SobrietyTimerProps {
  minutesToSober: number
}

export default function SobrietyTimer({ minutesToSober }: SobrietyTimerProps) {
  if (minutesToSober <= 0) {
    return (
      <div className="bg-[var(--color-bg-card)] rounded-xl p-4 text-center">
        <p className="text-sm text-[var(--color-text-secondary)]">Sober In</p>
        <p className="text-2xl font-semibold text-[var(--color-bac-safe)] mt-1">
          Now
        </p>
      </div>
    )
  }

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-4 text-center">
      <p className="text-sm text-[var(--color-text-secondary)]">Sober In</p>
      <p className="text-2xl font-semibold text-[var(--color-text-primary)] mt-1">
        {formatDuration(minutesToSober)}
      </p>
    </div>
  )
}
