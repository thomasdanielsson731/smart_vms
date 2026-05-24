export type UserRole = 'admin' | 'viewer'

export interface AuthUser {
  username: string
  role: UserRole
  displayName: string
}

export interface AuthState {
  user: AuthUser | null
  loading: boolean
  configured: boolean
}
