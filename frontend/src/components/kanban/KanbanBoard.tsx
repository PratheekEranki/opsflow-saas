import { useState } from 'react'
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { KanbanBoard as KanbanBoardType, Ticket, TicketStatus } from '../../types'
import KanbanColumn from './KanbanColumn'
import TicketCard from './TicketCard'

const COLUMNS: { status: TicketStatus; label: string; color: string }[] = [
  { status: 'TODO', label: 'To Do', color: 'bg-gray-100' },
  { status: 'IN_PROGRESS', label: 'In Progress', color: 'bg-blue-50' },
  { status: 'IN_REVIEW', label: 'In Review', color: 'bg-yellow-50' },
  { status: 'DONE', label: 'Done', color: 'bg-green-50' },
]

interface Props {
  board: KanbanBoardType
  onStatusChange: (ticketId: string, status: TicketStatus, position?: number) => void
}

export default function KanbanBoard({ board, onStatusChange }: Props) {
  const [activeTicket, setActiveTicket] = useState<Ticket | null>(null)

  const sensors = useSensors(useSensor(PointerSensor, {
    activationConstraint: { distance: 5 },
  }))

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setActiveTicket(null)
    if (!over || active.id === over.id) return

    const ticketId = active.id as string
    const targetStatus = over.data.current?.status as TicketStatus || over.id as TicketStatus
    onStatusChange(ticketId, targetStatus)
  }

  const handleDragStart = (event: DragStartEvent) => {
    const ticket = Object.values(board).flat().find(t => t.id === String(event.active.id))
    setActiveTicket(ticket || null)
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners}
      onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 h-full overflow-x-auto pb-4">
        {COLUMNS.map(col => (
          <KanbanColumn key={col.status} status={col.status} label={col.label}
            color={col.color} tickets={board[col.status] || []} />
        ))}
      </div>
      <DragOverlay>
        {activeTicket && <TicketCard ticket={activeTicket} isDragging />}
      </DragOverlay>
    </DndContext>
  )
}
