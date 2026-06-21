import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  email: string
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  expiresAt: string
  role: string
}

interface AuthState {
  accessToken: string | null
  refreshToken: string | null
  user: AuthUser | null
  login: (response: AuthResponse) => void
  logout: () => void
}

function parseJwt(token: string): { sub?: string; email?: string } | null {
  try {
    const base64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    return JSON.parse(atob(base64))
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      user: null,
      login: (response) => {
        const payload = parseJwt(response.accessToken)
        set({
          accessToken: response.accessToken,
          refreshToken: response.refreshToken,
          user: {
            id: payload?.sub ?? '',
            email: payload?.email ?? '',
            role: response.role,
          },
        })
      },
      logout: () => set({ accessToken: null, refreshToken: null, user: null }),
    }),
    { name: 'syndic-auth' }
  )
)
