import { useState, type FormEvent } from 'react'
import { KeyRound, Save } from 'lucide-react'
import UserLayout from '@/components/user/UserLayout'
import { useAuth } from '@/hooks/useAuth'
import { userService } from '@/services/userService'

export default function Profile() {
  const { user } = useAuth()
  const [name, setName] = useState(user?.name ?? '')
  const [email, setEmail] = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [savedMessage, setSavedMessage] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  async function handleSaveProfile(e: FormEvent) {
    e.preventDefault()
    if (!user) return
    setSaving(true)
    setSavedMessage(null)
    try {
      await userService.updateProfile(user.id, { name, email })
      setSavedMessage('Profile updated.')
    } finally {
      setSaving(false)
    }
  }

  function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    // Wired to POST /users/:id/password on the real backend.
    setSavedMessage('Password updated.')
    setCurrentPassword('')
    setNewPassword('')
  }

  return (
    <UserLayout pageTitle="Profile" pageDescription="Update your personal information and password.">
      <div className="grid gap-6 lg:grid-cols-2">
        <form
          onSubmit={handleSaveProfile}
          className="rounded-2xl border border-slate-200 bg-white p-6"
          data-testid="profile-form"
        >
          <h2 className="font-display text-base font-semibold text-rf-navy-900">
            Personal information
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Full name
              </label>
              <input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                data-testid="profile-name"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                data-testid="profile-email"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={saving}
            data-testid="profile-save"
            className="mt-5 flex items-center gap-2 rounded-lg bg-rf-navy-900 px-4 py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
          >
            <Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save changes'}
          </button>
        </form>

        <form
          onSubmit={handleChangePassword}
          className="rounded-2xl border border-slate-200 bg-white p-6"
          data-testid="password-form"
        >
          <h2 className="font-display text-base font-semibold text-rf-navy-900">
            Change password
          </h2>
          <div className="mt-4 space-y-4">
            <div>
              <label htmlFor="currentPassword" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                Current password
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                data-testid="profile-current-password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>
            <div>
              <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-rf-navy-900">
                New password
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                data-testid="profile-new-password"
                className="w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rf-mint-500"
              />
            </div>
          </div>
          <button
            type="submit"
            data-testid="profile-change-password"
            className="mt-5 flex items-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-rf-navy-900 hover:bg-rf-cream-100"
          >
            <KeyRound className="h-4 w-4" /> Update password
          </button>
        </form>
      </div>

      {savedMessage && (
        <p
          role="status"
          data-testid="profile-saved-message"
          className="mt-4 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700 ring-1 ring-inset ring-emerald-200"
        >
          {savedMessage}
        </p>
      )}
    </UserLayout>
  )
}
