import { Bell, Search, LogOut } from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const [search, setSearch] = useState('')

  return (
    <header className="h-14 bg-white border-b px-6 flex items-center justify-between flex-shrink-0">
      {/* Search */}
      <div className="relative w-80">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search tickets..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-3">
        <button className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg">
          <Bell className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 pl-3 border-l">
          <div className="w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center text-white text-sm font-medium">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="text-sm">
            <p className="font-medium text-gray-900">{user?.firstName} {user?.lastName}</p>
            <p className="text-gray-500 text-xs">{user?.role}</p>
          </div>
          <button onClick={logout} className="p-1.5 text-gray-400 hover:text-red-500 ml-1">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  )
}
