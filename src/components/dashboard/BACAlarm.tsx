import { useState, useEffect, useCallback } from 'react'
import { sendNotification, requestNotificationPermission, canNotify } from '../../lib/notifications'

interface BACAlarmProps {
  currentBAC: number
}

export default function BACAlarm({ currentBAC }: BACAlarmProps) {
  const [threshold, setThreshold] = useState<number>(() => {
    const saved = localStorage.getItem('bacAlarmThreshold')
    return saved ? parseFloat(saved) : 0.08
  })
  const [enabled, setEnabled] = useState<boolean>(() => {
    return localStorage.getItem('bacAlarmEnabled') === 'true'
  })
  const [alarmFired, setAlarmFired] = useState(false)

  useEffect(() => {
    localStorage.setItem('bacAlarmThreshold', threshold.toString())
  }, [threshold])

  useEffect(() => {
    localStorage.setItem('bacAlarmEnabled', enabled.toString())
  }, [enabled])

  const handleToggle = useCallback(async () => {
    if (!enabled) {
      const granted = await requestNotificationPermission()
      if (!granted) {
        alert('Notification permission is required for BAC alarm. Please enable notifications in your browser settings.')
        return
      }
    }
    setEnabled((prev) => !prev)
    setAlarmFired(false)
  }, [enabled])

  // Check BAC against threshold
  useEffect(() => {
    if (!enabled) return
    if (currentBAC >= threshold && !alarmFired) {
      setAlarmFired(true)
      if (canNotify()) {
        sendNotification(
          'BAC Alarm',
          `Your BAC (${currentBAC.toFixed(3)}) has reached your limit of ${threshold.toFixed(2)}`,
        )
      }
    }
    if (currentBAC < threshold) {
      setAlarmFired(false)
    }
  }, [currentBAC, threshold, enabled, alarmFired])

  return (
    <div className="bg-[var(--color-bg-card)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm text-[var(--color-text-secondary)]">BAC Alarm</p>
        <button
          onClick={handleToggle}
          className={`relative w-12 h-6 rounded-full transition-colors ${
            enabled ? 'bg-[var(--color-accent)]' : 'bg-[var(--color-bg-secondary)]'
          }`}
        >
          <span
            className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
              enabled ? 'translate-x-6' : ''
            }`}
          />
        </button>
      </div>
      {enabled && (
        <div className="flex items-center gap-3">
          <label className="text-sm text-[var(--color-text-secondary)]">Limit:</label>
          <input
            type="range"
            min="0.02"
            max="0.15"
            step="0.01"
            value={threshold}
            onChange={(e) => setThreshold(parseFloat(e.target.value))}
            className="flex-1 accent-[var(--color-accent)]"
          />
          <span className="text-sm font-mono text-[var(--color-text-primary)] w-12 text-right">
            {threshold.toFixed(2)}
          </span>
        </div>
      )}
    </div>
  )
}
