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
