import { useLiveQuery } from 'dexie-react-hooks'
import { db, type CustomDrink } from '../db/schema'
import { DEFAULT_DRINKS } from '../lib/constants'

export function useDrinks() {
  const customDrinks = useLiveQuery(() => db.customDrinks.toArray()) ?? []

  const allDrinks = [
    ...DEFAULT_DRINKS.map((d, i) => ({ ...d, id: -(i + 1), isDefault: true as const })),
    ...customDrinks.map((d) => ({ ...d, isDefault: false as const })),
  ]

  async function addCustomDrink(
    data: Omit<CustomDrink, 'id'>,
  ): Promise<number> {
    return db.customDrinks.add(data as CustomDrink)
  }

  async function updateCustomDrink(
    id: number,
    data: Partial<Omit<CustomDrink, 'id'>>,
  ) {
    await db.customDrinks.update(id, data)
  }

  async function deleteCustomDrink(id: number) {
    await db.customDrinks.delete(id)
  }

  return { allDrinks, customDrinks, addCustomDrink, updateCustomDrink, deleteCustomDrink }
}
