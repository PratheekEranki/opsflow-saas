import api from './api'
import type { Ticket, KanbanBoard, PageResponse, TicketStatus, TicketPriority, TicketType } from '../types'

export const ticketService = {
  getBoard: (projectId: string): Promise<KanbanBoard> =>
    api.get(`/projects/${projectId}/tickets/board`).then(r => r.data),

  getTickets: (projectId: string, page = 0, size = 20): Promise<PageResponse<Ticket>> =>
    api.get(`/projects/${projectId}/tickets`, { params: { page, size } }).then(r => r.data),

  createTicket: (projectId: string, data: {
    title: string
    description?: string
    priority: TicketPriority
    type: TicketType
    assigneeId?: string
  }): Promise<Ticket> =>
    api.post(`/projects/${projectId}/tickets`, data).then(r => r.data),

  updateStatus: (projectId: string, ticketId: string, status: TicketStatus, position?: number): Promise<Ticket> =>
    api.patch(`/projects/${projectId}/tickets/${ticketId}/status`, { status, position }).then(r => r.data),

  search: (query: string, page = 0): Promise<PageResponse<Ticket>> =>
    api.get('/search/tickets', { params: { q: query, page } }).then(r => r.data),
}
