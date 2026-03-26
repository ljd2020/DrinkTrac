import { useLiveQuery } from 'dexie-react-hooks'
import { db, type Profile } from '../db/schema'

export function useProfiles() {
  const profiles = useLiveQuery(() => db.profiles.toArray()) ?? []
  const defaultProfile = profiles.find((p) => p.isDefault) ?? profiles[0]

  async function addProfile(
    data: Omit<Profile, 'id' | 'createdAt' | 'isDefault'>,
  ): Promise<number> {
    const count = await db.profiles.count()
    return db.profiles.add({
      ...data,
      isDefault: count === 0,
      createdAt: new Date(),
    } as Profile)
  }

  async function updateProfile(
    id: number,
    data: Partial<Omit<Profile, 'id' | 'createdAt'>>,
  ) {
    await db.profiles.update(id, data)
  }

  async function deleteProfile(id: number) {
    await db.profiles.delete(id)
    // If we deleted the default, make the first remaining one default
    const remaining = await db.profiles.toArray()
    if (remaining.length > 0 && !remaining.some((p) => p.isDefault)) {
      await db.profiles.update(remaining[0].id, { isDefault: true })
    }
    // Clean up session drinks for this profile
    await db.sessionDrinks.where('profileId').equals(id).delete()
  }

  async function setDefaultProfile(id: number) {
    await db.transaction('rw', db.profiles, async () => {
      await db.profiles.toCollection().modify({ isDefault: false })
      await db.profiles.update(id, { isDefault: true })
    })
  }

  return { profiles, defaultProfile, addProfile, updateProfile, deleteProfile, setDefaultProfile }
}
