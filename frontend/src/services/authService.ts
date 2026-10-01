import api from './api'

export const authService = {
  login: (email: string, password: string, organizationSlug?: string) =>
    api.post('/auth/login', { email, password, organizationSlug }).then(r => r.data),

  register: (data: {
    organizationName: string
    slug: string
    email: string
    firstName: string
    lastName: string
    password: string
  }) => api.post('/organizations/register', data).then(r => r.data),
}
