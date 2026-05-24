import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadEnv } from 'vite'

export type UserRole = 'admin' | 'viewer'

export interface SessionUser {
  username: string
  role: UserRole
  displayName: string
}

export interface AuthEnv {
  sessionSecret: string
  sessionTtlHours: number
  adminUser: string
  adminPassword: string
  viewerUser: string
  viewerPassword: string
  cookieSecure: boolean
}

const COOKIE_NAME = 'smartvms_session'
const MAX_LOGIN_ATTEMPTS = 5
const LOGIN_WINDOW_MS = 15 * 60_000

const loginAttempts = new Map<string, { count: number; resetAt: number }>()

export function loadAuthEnv(mode: string, cwd: string): AuthEnv {
  const env = loadEnv(mode, cwd, '')

  let sessionSecret =
    env.SMARTVMS_SESSION_SECRET || env.VITE_SMARTVMS_SESSION_SECRET || ''
  if (!sessionSecret) {
    sessionSecret = randomBytes(32).toString('hex')
    console.warn(
      '[auth] SMARTVMS_SESSION_SECRET saknas — tillfällig nyckel genererad (sessioner försvinner vid omstart).',
    )
  }

  const ttlRaw = env.SMARTVMS_SESSION_TTL_HOURS || '8'
  const sessionTtlHours = Math.min(168, Math.max(1, Number(ttlRaw) || 8))

  return {
    sessionSecret,
    sessionTtlHours,
    adminUser: env.SMARTVMS_ADMIN_USER || 'admin',
    adminPassword: env.SMARTVMS_ADMIN_PASSWORD || '',
    viewerUser: env.SMARTVMS_VIEWER_USER || '',
    viewerPassword: env.SMARTVMS_VIEWER_PASSWORD || '',
    cookieSecure: env.SMARTVMS_COOKIE_SECURE === 'true',
  }
}

export function isAuthConfigured(env: AuthEnv): boolean {
  return Boolean(env.adminPassword)
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) return false
  return timingSafeEqual(bufA, bufB)
}

function displayNameFor(role: UserRole, username: string): string {
  if (role === 'admin') return 'Administratör'
  return username.charAt(0).toUpperCase() + username.slice(1)
}

export function authenticateUser(
  username: string,
  password: string,
  env: AuthEnv,
): SessionUser | null {
  if (!password || !isAuthConfigured(env)) return null

  if (safeEqual(username, env.adminUser) && safeEqual(password, env.adminPassword)) {
    return {
      username: env.adminUser,
      role: 'admin',
      displayName: displayNameFor('admin', env.adminUser),
    }
  }

  if (
    env.viewerUser &&
    env.viewerPassword &&
    safeEqual(username, env.viewerUser) &&
    safeEqual(password, env.viewerPassword)
  ) {
    return {
      username: env.viewerUser,
      role: 'viewer',
      displayName: displayNameFor('viewer', env.viewerUser),
    }
  }

  return null
}

interface SessionPayload {
  sub: string
  role: UserRole
  name: string
  exp: number
  iat: number
}

function signPayload(payloadB64: string, secret: string): string {
  return createHmac('sha256', secret).update(payloadB64).digest('base64url')
}

export function createSessionToken(user: SessionUser, env: AuthEnv): string {
  const now = Math.floor(Date.now() / 1000)
  const payload: SessionPayload = {
    sub: user.username,
    role: user.role,
    name: user.displayName,
    iat: now,
    exp: now + env.sessionTtlHours * 3600,
  }
  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sig = signPayload(payloadB64, env.sessionSecret)
  return `${payloadB64}.${sig}`
}

export function verifySessionToken(token: string, env: AuthEnv): SessionUser | null {
  const parts = token.split('.')
  if (parts.length !== 2) return null
  const [payloadB64, sig] = parts
  const expected = signPayload(payloadB64, env.sessionSecret)
  try {
    const sigBuf = Buffer.from(sig)
    const expBuf = Buffer.from(expected)
    if (sigBuf.length !== expBuf.length || !timingSafeEqual(sigBuf, expBuf)) return null
  } catch {
    return null
  }

  try {
    const payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8'),
    ) as SessionPayload
    if (!payload.sub || !payload.role || !payload.exp) return null
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return {
      username: payload.sub,
      role: payload.role,
      displayName: payload.name || payload.sub,
    }
  } catch {
    return null
  }
}

function parseCookies(header: string | undefined): Record<string, string> {
  if (!header) return {}
  return Object.fromEntries(
    header.split(';').map((part) => {
      const [k, ...rest] = part.trim().split('=')
      return [k, decodeURIComponent(rest.join('='))]
    }),
  )
}

export function sessionFromRequest(req: IncomingMessage, env: AuthEnv): SessionUser | null {
  const cookies = parseCookies(req.headers.cookie)
  const token = cookies[COOKIE_NAME]
  if (!token) return null
  return verifySessionToken(token, env)
}

function cookieMaxAge(env: AuthEnv): number {
  return env.sessionTtlHours * 3600
}

export function setSessionCookie(res: ServerResponse, token: string, env: AuthEnv): void {
  const parts = [
    `${COOKIE_NAME}=${encodeURIComponent(token)}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    `Max-Age=${cookieMaxAge(env)}`,
  ]
  if (env.cookieSecure) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

export function clearSessionCookie(res: ServerResponse, env: AuthEnv): void {
  const parts = [
    `${COOKIE_NAME}=`,
    'Path=/',
    'HttpOnly',
    'SameSite=Strict',
    'Max-Age=0',
  ]
  if (env.cookieSecure) parts.push('Secure')
  res.setHeader('Set-Cookie', parts.join('; '))
}

function clientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for']
  if (typeof forwarded === 'string') return forwarded.split(',')[0].trim()
  return req.socket.remoteAddress ?? 'unknown'
}

export function checkLoginRateLimit(req: IncomingMessage): boolean {
  const ip = clientIp(req)
  const now = Date.now()
  const entry = loginAttempts.get(ip)
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + LOGIN_WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_LOGIN_ATTEMPTS) return false
  entry.count += 1
  return true
}

export function readJsonBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (chunk: Buffer) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch {
        reject(new Error('invalid_json'))
      }
    })
    req.on('error', reject)
  })
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json; charset=utf-8')
  res.setHeader('Cache-Control', 'no-store')
  res.end(JSON.stringify(body))
}

export function applySecurityHeaders(res: ServerResponse): void {
  res.setHeader('X-Content-Type-Options', 'nosniff')
  res.setHeader('X-Frame-Options', 'DENY')
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=(self)')
}

export function requiresAuth(pathname: string): boolean {
  if (!pathname.startsWith('/api/')) return false
  if (pathname.startsWith('/api/auth/login')) return false
  if (pathname === '/api/auth/status') return false
  return true
}
