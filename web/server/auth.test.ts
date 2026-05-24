import { describe, expect, it } from 'vitest'
import {
  authenticateUser,
  createSessionToken,
  isAuthConfigured,
  requiresAuth,
  verifySessionToken,
  type AuthEnv,
} from './auth'

const env: AuthEnv = {
  sessionSecret: 'test-session-secret-32-chars-min!!',
  sessionTtlHours: 8,
  adminUser: 'admin',
  adminPassword: 'admin-pass',
  viewerUser: 'viewer',
  viewerPassword: 'viewer-pass',
  cookieSecure: false,
}

describe('authenticateUser', () => {
  it('accepts valid admin credentials', () => {
    const user = authenticateUser('admin', 'admin-pass', env)
    expect(user).toEqual({
      username: 'admin',
      role: 'admin',
      displayName: 'Administrator',
    })
  })

  it('accepts valid viewer credentials', () => {
    const user = authenticateUser('viewer', 'viewer-pass', env)
    expect(user?.role).toBe('viewer')
  })

  it('rejects wrong password', () => {
    expect(authenticateUser('admin', 'wrong', env)).toBeNull()
  })

  it('rejects when auth is not configured', () => {
    expect(authenticateUser('admin', 'admin-pass', { ...env, adminPassword: '' })).toBeNull()
    expect(isAuthConfigured({ ...env, adminPassword: '' })).toBe(false)
  })
})

describe('session tokens', () => {
  it('round-trips create and verify', () => {
    const user = authenticateUser('admin', 'admin-pass', env)!
    const token = createSessionToken(user, env)
    expect(verifySessionToken(token, env)).toEqual(user)
  })

  it('rejects tampered signature', () => {
    const token = createSessionToken(authenticateUser('admin', 'admin-pass', env)!, env)
    const [payload] = token.split('.')
    expect(verifySessionToken(`${payload}.bad-signature`, env)).toBeNull()
  })

  it('rejects expired token', () => {
    const user = authenticateUser('admin', 'admin-pass', env)!
    const token = createSessionToken(user, { ...env, sessionTtlHours: -1 })
    expect(verifySessionToken(token, env)).toBeNull()
  })
})

describe('requiresAuth', () => {
  it('protects camera and config APIs', () => {
    expect(requiresAuth('/api/camera/192.168.1.51/mjpg')).toBe(true)
    expect(requiresAuth('/api/config/vapix')).toBe(true)
    expect(requiresAuth('/api/ollama/api/chat')).toBe(true)
  })

  it('allows login and status without session', () => {
    expect(requiresAuth('/api/auth/login')).toBe(false)
    expect(requiresAuth('/api/auth/status')).toBe(false)
  })

  it('ignores non-API routes', () => {
    expect(requiresAuth('/dashboard')).toBe(false)
  })
})
