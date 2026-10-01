import { useAuthStore } from '../store/authStore'
import { Settings, LogOut } from 'lucide-react'

export default function SettingsPage() {
  const { user, organization, logout } = useAuthStore()

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900 mb-6">Settings</h1>

      <div className="space-y-4 max-w-lg">
        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Your Account</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{user?.firstName} {user?.lastName}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium">{user?.email}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Role</dt><dd className="font-medium">{user?.role}</dd></div>
          </dl>
        </div>

        <div className="card p-5">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Organization</h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-gray-500">Name</dt><dd className="font-medium">{organization?.name}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Slug</dt><dd className="font-medium">{organization?.slug}</dd></div>
            <div className="flex justify-between"><dt className="text-gray-500">Plan</dt><dd className="font-medium">{organization?.plan}</dd></div>
          </dl>
        </div>

        <button onClick={logout} className="flex items-center gap-2 text-sm text-red-600 hover:text-red-700 font-medium px-4 py-2 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  )
}
