import { useMemo } from 'react'
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
  return {
    timestamp: sd.timestamp,
    volumeMl: sd.volumeMl,
    abv: sd.abv,
    durationMinutes: sd.durationMinutes,
    stomachContent: sd.stomachContent,
  }
}

export function useBACCalculation(
  profile: Profile | undefined,
  sessionDrinks: SessionDrink[],
) {
  const timeSeries = useMemo<BACPoint[]>(() => {
    if (!profile || sessionDrinks.length === 0) return []
    const userProfile = profileToUserProfile(profile)
    const events = sessionDrinks.map(sessionDrinkToEvent)
    return computeBACTimeSeries(userProfile, events)
  }, [profile, sessionDrinks])

  const currentBAC = getCurrentBAC(timeSeries)
  const timeToSober = getTimeToSober(timeSeries)
  const peakBAC = getPeakBAC(timeSeries)

  return { timeSeries, currentBAC, timeToSober, peakBAC }
}
