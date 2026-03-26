import { METABOLISM_RATES, ABSORPTION_RATES } from './constants'
import { alcoholGrams } from './alcohol-utils'

export interface DrinkEvent {
  timestamp: Date
  volumeMl: number
  abv: number
  durationMinutes: number
  stomachContent: 'empty' | 'light' | 'moderate' | 'full'
}

export interface UserProfile {
  weightKg: number
  heightCm: number
  age: number
  sex: 'male' | 'female'
  drinkingFrequency: 'rarely' | 'occasionally' | 'regularly' | 'frequently'
}

export interface BACPoint {
  time: Date
  bac: number
}

/**
 * Compute the Widmark r factor (body water distribution ratio).
 * Uses standard Widmark constants validated against breathalyzer data.
 * Male: 0.68, Female: 0.55
 * These are the most widely accepted values used in forensic toxicology.
 */
export function computeWidmarkFactor(profile: UserProfile): number {
  return profile.sex === 'male' ? 0.68 : 0.55
}

/**
 * Model the absorption of a single drink over time.
 * Uses exponential absorption: absorbed(t) = totalAlcohol * (1 - e^(-ka * t))
 * Absorption begins at the start of drinking and the drink is gradually
 * consumed over durationMinutes.
 */
function drinkAbsorption(
  drink: DrinkEvent,
  timeMs: number,
  absorptionRate: number,
): number {
  const totalAlcoholGrams = alcoholGrams(drink.volumeMl, drink.abv)
  const drinkStartMs = drink.timestamp.getTime()
  const drinkEndMs = drinkStartMs + drink.durationMinutes * 60 * 1000

  if (timeMs <= drinkStartMs) return 0

  if (timeMs >= drinkEndMs) {
    // Drink fully consumed — absorption from the midpoint of consumption
    const midpointMs = drinkStartMs + (drink.durationMinutes * 60 * 1000) / 2
    const elapsedHours = (timeMs - midpointMs) / (3600 * 1000)
    return totalAlcoholGrams * (1 - Math.exp(-absorptionRate * elapsedHours))
  }

  // Still drinking — partial consumption, proportional absorption
  const fractionConsumed = (timeMs - drinkStartMs) / (drinkEndMs - drinkStartMs)
  const consumedGrams = totalAlcoholGrams * fractionConsumed
  // Absorption of the consumed portion, elapsed from midpoint of consumed portion
  const midpointMs = drinkStartMs + (timeMs - drinkStartMs) / 2
  const elapsedHours = (timeMs - midpointMs) / (3600 * 1000)
  return consumedGrams * (1 - Math.exp(-absorptionRate * elapsedHours))
}

/**
 * Compute BAC time series for a user profile and list of drink events.
 * Returns an array of { time, bac } points at 1-minute resolution.
 *
 * BAC(t) = absorbed_grams / (r * weight_grams) * 100
 *        = absorbed_grams / (r * weight_kg * 10)
 *
 * Elimination is zero-order at rate beta (g/dL per hour), starting
 * only after BAC exceeds a threshold (modeling first-pass metabolism delay).
 */
export function computeBACTimeSeries(
  profile: UserProfile,
  drinks: DrinkEvent[],
): BACPoint[] {
  if (drinks.length === 0) return []

  const r = computeWidmarkFactor(profile)
  const beta = METABOLISM_RATES[profile.drinkingFrequency] ?? 0.015

  const sortedDrinks = [...drinks].sort(
    (a, b) => a.timestamp.getTime() - b.timestamp.getTime(),
  )

  const startTime = sortedDrinks[0].timestamp.getTime()
  const maxDurationMs = 24 * 3600 * 1000
  const endTime = startTime + maxDurationMs

  const points: BACPoint[] = []
  const minuteMs = 60 * 1000

  // Track cumulative elimination
  let totalEliminated = 0

  for (let t = startTime; t <= endTime; t += minuteMs) {
    // Sum absorbed alcohol from all drinks
    let totalAbsorbedGrams = 0
    for (const drink of sortedDrinks) {
      const ka = ABSORPTION_RATES[drink.stomachContent] ?? 1.2
      totalAbsorbedGrams += drinkAbsorption(drink, t, ka)
    }

    // Raw BAC from absorption (g/dL)
    const bacRaw = totalAbsorbedGrams / (r * profile.weightKg * 10)

    // Eliminate while there's alcohol in the blood
    if (bacRaw > totalEliminated) {
      totalEliminated += beta * (1 / 60)
    }

    const bac = Math.max(0, bacRaw - totalEliminated)

    points.push({ time: new Date(t), bac })

    // Stop once BAC is effectively zero and we're past the last drink
    const lastDrinkTime = sortedDrinks[sortedDrinks.length - 1].timestamp.getTime()
    if (bac < 0.0005 && t > lastDrinkTime + 30 * minuteMs && totalAbsorbedGrams > 0.1) {
      break
    }
  }

  return points
}

/** Get the current BAC value from a time series */
export function getCurrentBAC(points: BACPoint[]): number {
  if (points.length === 0) return 0
  const now = Date.now()
  let closest = points[0]
  for (const point of points) {
    if (Math.abs(point.time.getTime() - now) < Math.abs(closest.time.getTime() - now)) {
      closest = point
    }
  }
  return closest.bac
}

/** Get estimated time to sobriety (BAC = 0) from now, in minutes */
export function getTimeToSober(points: BACPoint[]): number {
  if (points.length === 0) return 0
  const now = Date.now()

  let soberTime: number | null = null
  for (let i = points.length - 1; i >= 0; i--) {
    if (points[i].bac > 0) {
      soberTime = points[i].time.getTime()
      break
    }
  }

  if (soberTime === null || soberTime <= now) return 0
  return (soberTime - now) / (60 * 1000)
}

/** Get peak BAC value and when it occurs */
export function getPeakBAC(points: BACPoint[]): { bac: number; time: Date } | null {
  if (points.length === 0) return null
  let peak = points[0]
  for (const point of points) {
    if (point.bac > peak.bac) {
      peak = point
    }
  }
  return { bac: peak.bac, time: peak.time }
}
