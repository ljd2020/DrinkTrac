import { formatBAC } from '../../lib/alcohol-utils'
import { BAC_THRESHOLDS } from '../../lib/constants'

interface BACDisplayProps {
  bac: number
}

function getBACColor(bac: number): string {
  if (bac <= BAC_THRESHOLDS.safe) return 'var(--color-bac-safe)'
  if (bac <= BAC_THRESHOLDS.caution) return 'var(--color-bac-caution)'
  return 'var(--color-bac-danger)'
}

function getBACLabel(bac: number): string {
  if (bac <= 0.001) return 'Sober'
  if (bac <= BAC_THRESHOLDS.safe) return 'Under Limit'
  if (bac <= BAC_THRESHOLDS.caution) return 'Caution'
  return 'Over Limit'
}

export default function BACDisplay({ bac }: BACDisplayProps) {
  const color = getBACColor(bac)
  const label = getBACLabel(bac)

  return (
    <div className="text-center py-6">
      <p className="text-sm text-[var(--color-text-secondary)] mb-1 uppercase tracking-wider">
        Current BAC
      </p>
      <p
        className="text-6xl font-bold tabular-nums"
        style={{ color }}
      >
        {formatBAC(bac)}
      </p>
      <p
        className="text-sm font-medium mt-2"
        style={{ color }}
      >
        {label}
      </p>
    </div>
  )
}
