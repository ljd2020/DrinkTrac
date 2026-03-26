import { useLiveQuery } from 'dexie-react-hooks'
import { db, type SessionDrink } from '../db/schema'

export function useSession(profileId: number | undefined) {
  const sessionDrinks = useLiveQuery(
    () =>
      profileId
        ? db.sessionDrinks
            .where('profileId')
            .equals(profileId)
            .sortBy('timestamp')
        : [],
    [profileId],
  ) ?? []

  async function addSessionDrink(
    data: Omit<SessionDrink, 'id'>,
  ): Promise<number> {
    return db.sessionDrinks.add(data as SessionDrink)
  }

  async function updateSessionDrink(
    id: number,
    data: Partial<Omit<SessionDrink, 'id'>>,
  ) {
    await db.sessionDrinks.update(id, data)
  }

  async function finishDrink(id: number) {
    const drink = await db.sessionDrinks.get(id)
    if (!drink) return
    const now = new Date()
    const durationMinutes = Math.max(
      1,
      (now.getTime() - new Date(drink.timestamp).getTime()) / (60 * 1000),
    )
    await db.sessionDrinks.update(id, {
      finishedAt: now,
      durationMinutes: Math.round(durationMinutes),
    })
  }

  async function removeSessionDrink(id: number) {
    await db.sessionDrinks.delete(id)
  }

  async function clearSession() {
    if (!profileId) return
    await db.sessionDrinks.where('profileId').equals(profileId).delete()
  }

  return {
    sessionDrinks,
    addSessionDrink,
    updateSessionDrink,
    finishDrink,
    removeSessionDrink,
    clearSession,
  }
}
