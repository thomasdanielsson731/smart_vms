import type { AuthUser } from '@/types/auth'

const jsonHeaders = { 'Content-Type': 'application/json' }

async function parseAuthResponse(res: Response): Promise<never> {
  let message = 'Inloggning misslyckades'
  try {
    const data = (await res.json()) as { message?: string }
    if (data.message) message = data.message
  } catch {
    /* ignore */
  }
  throw new Error(message)
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
  if (res.status === 401) return null
  if (!res.ok) throw new Error('Kunde inte verifiera session')
  const data = (await res.json()) as { user: AuthUser }
  return data.user
}

export async function login(username: string, password: string): Promise<AuthUser> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: jsonHeaders,
    credentials: 'same-origin',
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) await parseAuthResponse(res)
  const data = (await res.json()) as { user: AuthUser }
  return data.user
}

export async function logout(): Promise<void> {
  await fetch('/api/auth/logout', {
    method: 'POST',
    credentials: 'same-origin',
  })
}

export async function fetchAuthStatus(): Promise<{ configured: boolean }> {
  const res = await fetch('/api/auth/status', { credentials: 'same-origin' })
  if (!res.ok) return { configured: false }
  return (await res.json()) as { configured: boolean }
}
