import { useParams } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ticketService } from '../services/ticketService'
import KanbanBoard from '../components/kanban/KanbanBoard'
import type { TicketStatus } from '../types'
import { useWebSocket } from '../hooks/useWebSocket'
import toast from 'react-hot-toast'
import { Loader2 } from 'lucide-react'

export default function KanbanPage() {
  const { projectId } = useParams<{ projectId: string }>()
  const queryClient = useQueryClient()

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
      <h1 className="text-lg font-semibold text-gray-900 mb-4">Kanban Board</h1>
      {board && (
        <KanbanBoard board={board}
          onStatusChange={(ticketId, status) => statusMutation.mutate({ ticketId, status })} />
      )}
    </div>
  )
}
