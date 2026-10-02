import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../services/ticketService'
import KanbanBoard from '../components/kanban/KanbanBoard'
import type { TicketStatus, TicketPriority, TicketType } from '../types'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'
import { Loader2, Plus, X } from 'lucide-react'

const PRIORITIES: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
const TYPES: TicketType[] = ['TASK', 'BUG', 'FEATURE', 'INCIDENT']

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as TicketPriority,
    type: 'TASK' as TicketType,
  })

  const { data: board, isLoading } = useQuery({
    queryKey: ['kanban', projectId],
    queryFn: () => ticketService.getBoard(projectId!),
    enabled: !!projectId,
  })

  const statusMutation = useMutation({
    mutationFn: ({ ticketId, status }: { ticketId: string; status: TicketStatus }) =>
      ticketService.updateStatus(projectId!, ticketId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['kanban', projectId] }),
    onError: () => toast.error('Failed to update ticket'),
  })

  const createMutation = useMutation({
    mutationFn: (data: typeof form) =>
      ticketService.createTicket(projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['kanban', projectId] })
      toast.success('Ticket created!')
      setShowModal(false)
      setForm({ title: '', description: '', priority: 'MEDIUM', type: 'TASK' })
    },
    onError: () => toast.error('Failed to create ticket'),
  })

  useWebSocket({
    projectId,
    onTicketUpdate: () => queryClient.invalidateQueries({ queryKey: ['kanban', projectId] }),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <div className="h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-lg font-semibold text-gray-900">Kanban Board</h1>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-1 bg-blue-600 text-white text-sm px-3 py-1.5 rounded-md hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {board && (
        <KanbanBoard
          board={board}
          onStatusChange={(ticketId, status) => statusMutation.mutate({ ticketId, status })}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Create Ticket</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ticket title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Optional description"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={e => setForm(f => ({ ...f, type: e.target.value as TicketType }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={e => setForm(f => ({ ...f, priority: e.target.value as TicketPriority }))}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 border border-gray-300 text-gray-700 text-sm px-3 py-2 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => createMutation.mutate(form)}
                disabled={!form.title.trim() || createMutation.isPending}
                className="flex-1 bg-blue-600 text-white text-sm px-3 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {createMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
