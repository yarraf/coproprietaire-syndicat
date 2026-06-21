import { client } from './client'
import type { AuthResponse } from '@/store/auth'

export const login = (email: string, password: string) =>
  client.post<AuthResponse>('/auth/login', { email, password })

export const refresh = (refreshToken: string) =>
  client.post<AuthResponse>('/auth/refresh', { refreshToken })
