import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Ticket } from '../../types'
import { AlertCircle, Bug, Star, Zap } from 'lucide-react'
import clsx from 'clsx'

const TYPE_ICONS = {
  TASK: Star, BUG: Bug, FEATURE: Zap, INCIDENT: AlertCircle,
}

const PRIORITY_COLORS = {
  LOW: 'text-gray-400', MEDIUM: 'text-blue-500',
  HIGH: 'text-orange-500', CRITICAL: 'text-red-500',
}

interface Props { ticket: Ticket; isDragging?: boolean }

export default function TicketCard({ ticket, isDragging }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging: sortableDragging } =
    useSortable({ id: ticket.id })

  const style = { transform: CSS.Transform.toString(transform), transition }
  const Icon = TYPE_ICONS[ticket.type]

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}
      className={clsx(
        'card p-3 cursor-grab active:cursor-grabbing select-none',
        (isDragging || sortableDragging) && 'opacity-50 rotate-2 shadow-lg'
      )}>
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="text-xs text-gray-400 font-mono">{ticket.ticketKey}</span>
        <Icon className={clsx('w-3.5 h-3.5 flex-shrink-0', PRIORITY_COLORS[ticket.priority])} />
      </div>
      <p className="text-sm text-gray-800 font-medium leading-snug line-clamp-2">{ticket.title}</p>
      {ticket.assignee && (
        <div className="mt-2 flex items-center gap-1.5">
          <div className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-xs font-medium text-primary-700">
            {ticket.assignee.firstName?.[0]}
          </div>
          <span className="text-xs text-gray-500 truncate">{ticket.assignee.firstName} {ticket.assignee.lastName}</span>
        </div>
      )}
    </div>
  )
}
