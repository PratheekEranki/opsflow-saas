import { useState, useEffect } from 'react'
import { Users, UserPlus, X, Loader2 } from 'lucide-react'
import api from '../services/api'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

interface Member {
  id: string
  firstName: string
  lastName: string
  email: string
  role: string
  active: boolean
  createdAt: string
}

interface InviteForm {
  firstName: string
  lastName: string
  email: string
  password: string
  role: 'MEMBER' | 'MANAGER' | 'ADMIN'
}

const BLANK: InviteForm = { firstName: '', lastName: '', email: '', password: '', role: 'MEMBER' }

export default function TeamPage() {
  const [members, setMembers]     = useState<Member[]>([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState<InviteForm>(BLANK)
  const [saving, setSaving]       = useState(false)

  const currentUser = useAuthStore(s => s.user)
  const isAdmin     = currentUser?.role === 'ADMIN'

  const fetchMembers = () => {
    setLoading(true)
    api.get('/users')
      .then(r => setMembers(r.data?.content ?? r.data ?? []))
      .catch(() => setMembers([]))
      .finally(() => setLoading(false))
  }

  useEffect(fetchMembers, [])

  const field = (name: keyof InviteForm) => ({
    value: form[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
      setForm(f => ({ ...f, [name]: e.target.value })),
  })

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await api.post('/users', form)
      toast.success(`${form.firstName} ${form.lastName} added to the team!`)
      setShowModal(false)
      setForm(BLANK)
      fetchMembers()
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message
      toast.error(msg || 'Failed to add member')
    } finally {
      setSaving(false)
    }
  }

  const roleColor = (role: string) => ({
    ADMIN:   'bg-purple-100 text-purple-700',
    MANAGER: 'bg-blue-100 text-blue-700',
    MEMBER:  'bg-gray-100 text-gray-600',
  }[role] ?? 'bg-gray-100 text-gray-600')

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Team</h1>
        {isAdmin && (
          <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
            <UserPlus className="w-4 h-4" />
            Add Member
          </button>
        )}
      </div>

      {/* Member list */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
        </div>
      ) : members.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <Users className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No team members yet.</p>
        </div>
      ) : (
        <div className="card divide-y">
          {members.map(m => (
            <div key={m.id} className="flex items-center justify-between px-5 py-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-semibold text-sm">
                  {m.firstName[0]}{m.lastName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{m.firstName} {m.lastName}</p>
                  <p className="text-xs text-gray-500">{m.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${roleColor(m.role)}`}>{m.role}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${m.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {m.active ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Member Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Add Team Member</h2>
              <button onClick={() => { setShowModal(false); setForm(BLANK) }}
                      className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleInvite} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input className="input" required placeholder="Jane" {...field('firstName')} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input className="input" required placeholder="Doe" {...field('lastName')} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input className="input" type="email" required placeholder="jane@example.com" {...field('email')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Temporary Password</label>
                <input className="input" type="password" required minLength={8} placeholder="Min 8 characters" {...field('password')} />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <select className="input" value={form.role}
                        onChange={e => setForm(f => ({ ...f, role: e.target.value as InviteForm['role'] }))}>
                  <option value="MEMBER">Member</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => { setShowModal(false); setForm(BLANK) }}
                        className="btn-secondary flex-1 justify-center">
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Add Member'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
