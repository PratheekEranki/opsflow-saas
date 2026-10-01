import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import type { Ticket, TicketStatus } from '../../types'
import TicketCard from './TicketCard'
import clsx from 'clsx'

interface Props {
  status: TicketStatus
  label: string
  color: string
  tickets: Ticket[]
}

export default function KanbanColumn({ status, label, color, tickets }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status, data: { status } })

  return (
    <div className="flex-shrink-0 w-72">
      <div className={clsx('rounded-xl p-3 h-full flex flex-col', color, isOver && 'ring-2 ring-primary-400')}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-700">{label}</h3>
          <span className="text-xs bg-white px-2 py-0.5 rounded-full font-medium text-gray-500">
            {tickets.length}
          </span>
        </div>
        <div ref={setNodeRef} className="flex-1 space-y-2 min-h-[200px]">
          <SortableContext items={tickets.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </SortableContext>
        </div>
      </div>
    </div>
  )
}
