import { useAuthStore } from '../store/authStore'
import { LayoutDashboard } from 'lucide-react'

export default function DashboardPage() {
  const { user, organization } = useAuthStore()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">
          Welcome back, {user?.firstName} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">{organization?.name} · {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Open Tickets', value: '—', color: 'text-blue-600' },
          { label: 'In Progress', value: '—', color: 'text-yellow-600' },
          { label: 'Completed Today', value: '—', color: 'text-green-600' },
        ].map(stat => (
          <div key={stat.label} className="card p-5">
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className={`text-3xl font-bold mt-1 ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-8 text-center text-gray-400">
        <LayoutDashboard className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">Select a project to view its Kanban board</p>
      </div>
    </div>
  )
}
