import { ALCOHOL_DENSITY } from './constants'

/** Convert drink volume (mL) and ABV (0-1) to grams of pure alcohol */
export function alcoholGrams(volumeMl: number, abv: number): number {
  return volumeMl * abv * ALCOHOL_DENSITY
}

/** Calculate standard drinks (one standard drink = 14g of pure alcohol in the US) */
export function standardDrinks(volumeMl: number, abv: number): number {
  return alcoholGrams(volumeMl, abv) / 14
}

/** Format BAC as a string with 3 decimal places */
export function formatBAC(bac: number): string {
  return Math.max(0, bac).toFixed(3)
}

/** Format minutes into hours and minutes string */
export function formatDuration(totalMinutes: number): string {
  if (totalMinutes <= 0) return 'Sober'
  const rounded = Math.round(totalMinutes)
  const hours = Math.floor(rounded / 60)
  const minutes = rounded % 60
  if (hours === 0) return `${minutes}m`
  if (minutes === 0) return `${hours}h`
  return `${hours}h ${minutes}m`
}
