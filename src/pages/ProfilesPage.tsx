import { useState } from 'react'
import ProfileForm from '../components/profile/ProfileForm'
import { useProfiles } from '../hooks/useProfiles'
import type { Profile } from '../db/schema'

export default function ProfilesPage() {
  const {
    profiles,
    addProfile,
    updateProfile,
    deleteProfile,
    setDefaultProfile,
  } = useProfiles()
  const [showForm, setShowForm] = useState(false)
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null)

  function handleSubmit(data: Omit<Profile, 'id' | 'createdAt' | 'isDefault'>) {
    if (editingProfile) {
      updateProfile(editingProfile.id, data)
    } else {
      addProfile(data)
    }
    setShowForm(false)
    setEditingProfile(null)
  }

  function handleEdit(profile: Profile) {
    setEditingProfile(profile)
    setShowForm(true)
  }

  if (showForm) {
    const useImperial = localStorage.getItem('useImperial') === 'true'
    const initial = editingProfile
      ? {
          ...editingProfile,
          weightKg: useImperial ? editingProfile.weightKg / 0.453592 : editingProfile.weightKg,
          heightCm: useImperial ? editingProfile.heightCm / 2.54 : editingProfile.heightCm,
        }
      : undefined

    return (
      <div className="p-4 safe-area-top">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)] mb-4">
          {editingProfile ? 'Edit Profile' : 'Create Profile'}
        </h1>
        <ProfileForm
          initial={initial}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false)
            setEditingProfile(null)
          }}
          submitLabel={editingProfile ? 'Update' : 'Create'}
        />
      </div>
    )
  }

  return (
    <div className="p-4 safe-area-top space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-[var(--color-text-primary)]">
          Profiles
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-accent)] text-white text-sm font-medium hover:bg-[var(--color-accent-hover)] transition-colors"
        >
          + Add
        </button>
      </div>

      {profiles.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-4xl mb-2">👤</p>
          <p className="text-[var(--color-text-secondary)]">No profiles yet</p>
          <p className="text-sm text-[var(--color-text-secondary)] mt-1">
            Create a profile to start tracking
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className={`bg-[var(--color-bg-card)] rounded-xl p-4 ${
                profile.isDefault ? 'ring-2 ring-[var(--color-accent)]' : ''
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">
                    {profile.name}
                    {profile.isDefault && (
                      <span className="ml-2 text-xs text-[var(--color-accent)]">
                        Active
                      </span>
                    )}
                  </p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    {profile.sex === 'male' ? 'Male' : 'Female'} &middot;{' '}
                    {profile.age}y &middot;{' '}
                    {Math.round(profile.weightKg)}kg &middot;{' '}
                    {Math.round(profile.heightCm)}cm
                  </p>
                </div>
                <div className="flex gap-2">
                  {!profile.isDefault && (
                    <button
                      onClick={() => setDefaultProfile(profile.id)}
                      className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                    >
                      Set Active
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(profile)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete ${profile.name}?`)) {
                        deleteProfile(profile.id)
                      }
                    }}
                    className="text-xs px-3 py-1.5 rounded-lg bg-[var(--color-bg-secondary)] text-[var(--color-bac-danger)]"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-[var(--color-bg-card)] rounded-xl p-4 mt-6">
        <p className="text-xs text-[var(--color-text-secondary)] leading-relaxed">
          <strong>Disclaimer:</strong> DrinkTrac provides BAC estimates for educational
          purposes only. Actual BAC varies based on many factors not modeled here.
          Never use this app to determine if you are safe to drive.
        </p>
      </div>
    </div>
  )
}
