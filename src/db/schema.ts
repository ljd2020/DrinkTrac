import Dexie, { type EntityTable } from 'dexie'

export interface Profile {
  id: number
  name: string
  weightKg: number
  heightCm: number
  age: number
  sex: 'male' | 'female'
  drinkingFrequency: 'rarely' | 'occasionally' | 'regularly' | 'frequently'
  isDefault: boolean
  createdAt: Date
}

export interface CustomDrink {
  id: number
  name: string
  volumeMl: number
  abv: number
  icon: string
  category: 'beer' | 'wine' | 'spirit' | 'cocktail' | 'custom'
  defaultDurationMinutes: number
}

export interface SessionDrink {
  id: number
  profileId: number
  drinkName: string
  volumeMl: number
  abv: number
  icon: string
  timestamp: Date
  durationMinutes: number
  finishedAt: Date | null
  stomachContent: 'empty' | 'light' | 'moderate' | 'full'
}

export const db = new Dexie('DrinkTracDB') as Dexie & {
  profiles: EntityTable<Profile, 'id'>
  customDrinks: EntityTable<CustomDrink, 'id'>
  sessionDrinks: EntityTable<SessionDrink, 'id'>
}

db.version(1).stores({
  profiles: '++id, name, isDefault',
  customDrinks: '++id, name, category',
  sessionDrinks: '++id, profileId, timestamp',
})

db.version(2).stores({
  profiles: '++id, name, isDefault',
  customDrinks: '++id, name, category',
  sessionDrinks: '++id, profileId, timestamp',
}).upgrade((tx) => {
  // Migrate existing session drinks: mark them as finished
  return tx.table('sessionDrinks').toCollection().modify((drink: Record<string, unknown>) => {
    const timestamp = drink['timestamp'] as Date
    const durationMinutes = drink['durationMinutes'] as number
    drink['finishedAt'] = new Date(new Date(timestamp).getTime() + durationMinutes * 60 * 1000)
  })
})
