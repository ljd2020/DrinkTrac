import { useMemo, useState, useEffect } from 'react'
import {
  computeBACTimeSeries,
  getCurrentBAC,
  getTimeToSober,
  getPeakBAC,
  type UserProfile,
  type DrinkEvent,
  type BACPoint,
} from '../lib/bac-engine'
import type { Profile, SessionDrink } from '../db/schema'

function profileToUserProfile(profile: Profile): UserProfile {
  return {
    weightKg: profile.weightKg,
    heightCm: profile.heightCm,
    age: profile.age,
    sex: profile.sex,
    drinkingFrequency: profile.drinkingFrequency,
  }
}

function sessionDrinkToEvent(sd: SessionDrink): DrinkEvent {
  let durationMinutes = sd.durationMinutes

  // For in-progress drinks (not yet finished), use elapsed time while
  // actively drinking, but cap at the default duration. If a user forgets
  // to finish, the drink simply uses its default duration.
  if (!sd.finishedAt) {
    const elapsedMinutes = (Date.now() - new Date(sd.timestamp).getTime()) / (60 * 1000)
    durationMinutes = Math.min(durationMinutes, Math.max(1, elapsedMinutes))
  }

  return {
    timestamp: sd.timestamp,
    volumeMl: sd.volumeMl,
    abv: sd.abv,
    durationMinutes,
    stomachContent: sd.stomachContent,
  }
}

export function useBACCalculation(
  profile: Profile | undefined,
  sessionDrinks: SessionDrink[],
) {
  // Tick every 30s to recompute BAC for in-progress drinks
  const [tick, setTick] = useState(0)
  useEffect(() => {
    const hasInProgress = sessionDrinks.some((d) => !d.finishedAt)
    if (!hasInProgress) return
    const interval = setInterval(() => setTick((t) => t + 1), 30000)
    return () => clearInterval(interval)
  }, [sessionDrinks])

  const timeSeries = useMemo<BACPoint[]>(() => {
    if (!profile || sessionDrinks.length === 0) return []
    const userProfile = profileToUserProfile(profile)
    const events = sessionDrinks.map(sessionDrinkToEvent)
    return computeBACTimeSeries(userProfile, events)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile, sessionDrinks, tick])

  const currentBAC = getCurrentBAC(timeSeries)
  const timeToSober = getTimeToSober(timeSeries)
  const peakBAC = getPeakBAC(timeSeries)

  return { timeSeries, currentBAC, timeToSober, peakBAC }
}
