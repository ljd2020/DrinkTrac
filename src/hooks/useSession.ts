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

  async function removeSessionDrink(id: number) {
    await db.sessionDrinks.delete(id)
  }

  async function clearSession() {
    if (!profileId) return
    await db.sessionDrinks.where('profileId').equals(profileId).delete()
  }

  return { sessionDrinks, addSessionDrink, removeSessionDrink, clearSession }
}
