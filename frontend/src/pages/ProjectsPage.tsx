import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FolderKanban, Plus, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'

interface Project {
  id: string
  name: string
  key: string
  description: string
  status: string
}

export default function ProjectsPage() {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', key: '', description: '' })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    api.get('/projects').then(r => setProjects(r.data?.content ?? r.data ?? [])).catch(() => setProjects([])).finally(() => setLoading(false))
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    try {
      const r = await api.post('/projects', form)
      setProjects(p => [r.data, ...p])
      setShowForm(false)
      setForm({ name: '', key: '', description: '' })
      toast.success('Project created!')
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to create project')
    } finally {
      setCreating(false)
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Projects</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" /> New Project
        </button>
      </div>

      {showForm && (
        <div className="card p-6 mb-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-4">Create Project</h2>
          <form onSubmit={handleCreate} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Project Name *</label>
                <input className="input" required placeholder="My Project" value={form.name}
                  onChange={e => { setForm(f => ({ ...f, name: e.target.value, key: e.target.value.slice(0,6).toUpperCase().replace(/\s/g,'') })) }} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Key *</label>
                <input className="input" required placeholder="PROJ" maxLength={6} value={form.key}
                  onChange={e => setForm(f => ({ ...f, key: e.target.value.toUpperCase() }))} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
              <input className="input" placeholder="Optional description" value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
            <div className="flex gap-2 pt-1">
              <button type="submit" disabled={creating} className="btn-primary flex items-center gap-2">
                {creating && <Loader2 className="w-4 h-4 animate-spin" />} Create
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : projects.length === 0 ? (
        <div className="card p-12 text-center text-gray-400">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No projects yet. Create your first one!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map(p => (
            <div key={p.id} className="card p-5 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/projects/${p.id}`)}>
              <div className="flex items-start justify-between mb-2">
                <span className="text-xs font-bold text-primary-600 bg-primary-50 px-2 py-0.5 rounded">{p.key}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${p.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{p.status}</span>
              </div>
              <h3 className="font-semibold text-gray-900 mt-2">{p.name}</h3>
              {p.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{p.description}</p>}
              <button onClick={e => { e.stopPropagation(); navigate(`/projects/${p.id}/board`) }}
                className="mt-3 text-xs text-primary-600 hover:underline font-medium">
                Open Board →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
