export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  role: 'ADMIN' | 'MANAGER' | 'MEMBER'
  avatarUrl?: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  plan: 'FREE' | 'PRO' | 'ENTERPRISE'
}

export interface AuthState {
  accessToken: string
  refreshToken: string
  user: User
  organization: Organization
}

export interface Project {
  id: string
  name: string
  description?: string
  key: string
  status: 'ACTIVE' | 'ARCHIVED' | 'COMPLETED'
  owner?: User
  createdAt: string
}

export type TicketStatus = 'TODO' | 'IN_PROGRESS' | 'IN_REVIEW' | 'DONE' | 'CANCELLED'
export type TicketPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
export type TicketType = 'TASK' | 'BUG' | 'FEATURE' | 'INCIDENT'

export interface Ticket {
  id: string
  ticketKey: string
  ticketNumber: number
  title: string
  description?: string
  status: TicketStatus
  priority: TicketPriority
  type: TicketType
  assignee?: User
  reporter: User
  dueDate?: string
  estimatedHours?: number
  position: number
  projectId: string
  projectName: string
  createdAt: string
  updatedAt: string
}

export interface KanbanBoard {
  TODO: Ticket[]
  IN_PROGRESS: Ticket[]
  IN_REVIEW: Ticket[]
  DONE: Ticket[]
  CANCELLED: Ticket[]
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  entityType?: string
  entityId?: string
  readAt?: string
  createdAt: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}
