import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User, Organization } from '../types'

interface AuthStore {
  accessToken: string | null
  refreshToken: string | null
  user: User | null
  organization: Organization | null
  isAuthenticated: boolean
  setAuth: (data: {
    accessToken: string
    refreshToken: string
    userId: string
    organizationId: string
    email: string
    firstName: string
    lastName: string
    role: string
    organizationName: string
    organizationSlug: string
  }) => void
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      organization: null,
      isAuthenticated: false,

      setAuth: (data) => set({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        isAuthenticated: true,
        user: {
          id: data.userId,
          email: data.email,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role as User['role'],
        },
        organization: {
          id: data.organizationId,
          name: data.organizationName,
          slug: data.organizationSlug,
          plan: 'FREE',
        },
      }),

      logout: () => set({
        accessToken: null,
        refreshToken: null,
        user: null,
        organization: null,
        isAuthenticated: false,
      }),
    }),
    { name: 'opsflow-auth' }
  )
)
