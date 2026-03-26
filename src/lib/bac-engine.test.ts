import { describe, it, expect } from 'vitest'
import {
  computeWidmarkFactor,
  computeBACTimeSeries,
  getCurrentBAC,
  getPeakBAC,
  getTimeToSober,
  type UserProfile,
  type DrinkEvent,
} from './bac-engine'

const maleProfile: UserProfile = {
  weightKg: 81.6, // ~180 lbs
  heightCm: 178,
  age: 30,
  sex: 'male',
  drinkingFrequency: 'occasionally',
}

const femaleProfile: UserProfile = {
  weightKg: 63.5, // ~140 lbs
  heightCm: 165,
  age: 28,
  sex: 'female',
  drinkingFrequency: 'occasionally',
}

function makeDrink(overrides: Partial<DrinkEvent> = {}): DrinkEvent {
  return {
    timestamp: new Date('2024-01-01T20:00:00'),
    volumeMl: 355,
    abv: 0.05,
    durationMinutes: 15,
    stomachContent: 'light',
    ...overrides,
  }
}

describe('computeWidmarkFactor', () => {
  it('returns a reasonable r factor for males (~0.55-0.75)', () => {
    const r = computeWidmarkFactor(maleProfile)
    expect(r).toBeGreaterThan(0.5)
    expect(r).toBeLessThan(0.8)
  })

  it('returns a reasonable r factor for females (~0.45-0.65)', () => {
    const r = computeWidmarkFactor(femaleProfile)
    expect(r).toBeGreaterThan(0.4)
    expect(r).toBeLessThan(0.7)
  })

  it('males have a higher r factor than females of similar size', () => {
    const maleR = computeWidmarkFactor(maleProfile)
    const femaleR = computeWidmarkFactor({ ...femaleProfile, weightKg: maleProfile.weightKg, heightCm: maleProfile.heightCm, age: maleProfile.age })
    expect(maleR).toBeGreaterThan(femaleR)
  })
})

describe('computeBACTimeSeries', () => {
  it('returns empty array for no drinks', () => {
    expect(computeBACTimeSeries(maleProfile, [])).toEqual([])
  })

  it('returns points starting from the first drink time', () => {
    const drink = makeDrink()
    const points = computeBACTimeSeries(maleProfile, [drink])
    expect(points.length).toBeGreaterThan(0)
    expect(points[0].time.getTime()).toBe(drink.timestamp.getTime())
  })

  it('BAC rises and then falls back to 0', () => {
    const drink = makeDrink()
    const points = computeBACTimeSeries(maleProfile, [drink])

    // Should start near 0
    expect(points[0].bac).toBeLessThan(0.01)

    // Should have a peak > 0
    const peak = getPeakBAC(points)
    expect(peak).not.toBeNull()
    expect(peak!.bac).toBeGreaterThan(0)

    // Should end at 0
    expect(points[points.length - 1].bac).toBe(0)
  })

  it('one standard beer for 180lb male peaks around 0.02-0.04', () => {
    const drink = makeDrink({ stomachContent: 'empty' })
    const points = computeBACTimeSeries(maleProfile, [drink])
    const peak = getPeakBAC(points)!

    // One 12oz beer (355mL at 5%) for a ~180lb male
    // Expected peak BAC roughly 0.02-0.04
    expect(peak.bac).toBeGreaterThan(0.01)
    expect(peak.bac).toBeLessThan(0.05)
  })

  it('two beers result in higher BAC than one', () => {
    const now = new Date('2024-01-01T20:00:00')
    const oneBeer = [makeDrink({ timestamp: now })]
    const twoBeers = [
      makeDrink({ timestamp: now }),
      makeDrink({ timestamp: new Date(now.getTime() + 30 * 60000) }),
    ]

    const peak1 = getPeakBAC(computeBACTimeSeries(maleProfile, oneBeer))!
    const peak2 = getPeakBAC(computeBACTimeSeries(maleProfile, twoBeers))!

    expect(peak2.bac).toBeGreaterThan(peak1.bac)
  })

  it('full stomach results in lower peak BAC than empty stomach', () => {
    const drinkEmpty = makeDrink({ stomachContent: 'empty' })
    const drinkFull = makeDrink({ stomachContent: 'full' })

    const peakEmpty = getPeakBAC(computeBACTimeSeries(maleProfile, [drinkEmpty]))!
    const peakFull = getPeakBAC(computeBACTimeSeries(maleProfile, [drinkFull]))!

    // Full stomach absorbs slower, so peak is lower (but total alcohol is the same)
    expect(peakFull.bac).toBeLessThan(peakEmpty.bac)
  })

  it('lighter person has higher BAC than heavier person for same drink', () => {
    const drink = makeDrink()
    const light = { ...maleProfile, weightKg: 60 }
    const heavy = { ...maleProfile, weightKg: 100 }

    const peakLight = getPeakBAC(computeBACTimeSeries(light, [drink]))!
    const peakHeavy = getPeakBAC(computeBACTimeSeries(heavy, [drink]))!

    expect(peakLight.bac).toBeGreaterThan(peakHeavy.bac)
  })

  it('female has higher BAC than male of same weight', () => {
    const drink = makeDrink()
    const male: UserProfile = { ...maleProfile, weightKg: 70, heightCm: 170, age: 30 }
    const female: UserProfile = { ...femaleProfile, weightKg: 70, heightCm: 170, age: 30 }

    const peakMale = getPeakBAC(computeBACTimeSeries(male, [drink]))!
    const peakFemale = getPeakBAC(computeBACTimeSeries(female, [drink]))!

    expect(peakFemale.bac).toBeGreaterThan(peakMale.bac)
  })

  it('frequent drinker eliminates alcohol faster', () => {
    const drink = makeDrink()
    const rare: UserProfile = { ...maleProfile, drinkingFrequency: 'rarely' }
    const frequent: UserProfile = { ...maleProfile, drinkingFrequency: 'frequently' }

    const pointsRare = computeBACTimeSeries(rare, [drink])
    const pointsFreq = computeBACTimeSeries(frequent, [drink])

    // Frequent drinker should return to 0 faster
    const soberRare = pointsRare[pointsRare.length - 1].time.getTime()
    const soberFreq = pointsFreq[pointsFreq.length - 1].time.getTime()

    expect(soberFreq).toBeLessThan(soberRare)
  })
})

describe('getCurrentBAC', () => {
  it('returns 0 for empty points', () => {
    expect(getCurrentBAC([])).toBe(0)
  })

  it('returns the BAC closest to current time', () => {
    const now = new Date()
    const points = [
      { time: new Date(now.getTime() - 60000), bac: 0.05 },
      { time: new Date(now.getTime()), bac: 0.04 },
      { time: new Date(now.getTime() + 60000), bac: 0.03 },
    ]
    expect(getCurrentBAC(points)).toBe(0.04)
  })
})

describe('getTimeToSober', () => {
  it('returns 0 for empty points', () => {
    expect(getTimeToSober([])).toBe(0)
  })

  it('returns 0 if already sober', () => {
    const pastPoints = [
      { time: new Date(Date.now() - 3600000), bac: 0.02 },
      { time: new Date(Date.now() - 1800000), bac: 0 },
    ]
    expect(getTimeToSober(pastPoints)).toBe(0)
  })

  it('returns positive minutes if still have BAC', () => {
    const futurePoints = [
      { time: new Date(Date.now()), bac: 0.05 },
      { time: new Date(Date.now() + 3600000), bac: 0.02 },
      { time: new Date(Date.now() + 7200000), bac: 0 },
    ]
    const minutes = getTimeToSober(futurePoints)
    expect(minutes).toBeGreaterThan(0)
    expect(minutes).toBeLessThanOrEqual(120)
  })
})
