import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  applySecurityHeaders,
  authenticateUser,
  checkLoginRateLimit,
  clearSessionCookie,
  isAuthConfigured,
  loadAuthEnv,
  readJsonBody,
  requiresAuth,
  sendJson,
  sessionFromRequest,
  setSessionCookie,
  createSessionToken,
  type AuthEnv,
} from './server/auth'
import { appendAuditLog } from './server/audit-log'

type MiddlewareStack = {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
}

function attachAuthMiddleware(middlewares: MiddlewareStack, mode: string, cwd: string) {
  const env = loadAuthEnv(mode, cwd)

  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]

    // --- Auth routes ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      applySecurityHeaders(res)
      if (!isAuthConfigured(env)) {
        sendJson(res, 503, {
          error: 'auth_not_configured',
          message:
            'Set SMARTVMS_ADMIN_PASSWORD in web/.env and restart the dev server.',
        })
        return
      }

      if (!checkLoginRateLimit(req)) {
        sendJson(res, 429, {
          error: 'rate_limited',
          message: 'Too many login attempts. Try again in 15 minutes.',
        })
        return
      }

      try {
        const body = (await readJsonBody(req)) as { username?: string; password?: string }
        const username = (body.username ?? '').trim()
        const password = body.password ?? ''
        const user = authenticateUser(username, password, env)
        if (!user) {
          appendAuditLog(cwd, 'auth.login.failed', username || 'unknown')
          sendJson(res, 401, { error: 'invalid_credentials', message: 'Invalid username or password.' })
          return
        }
        const token = createSessionToken(user, env)
        setSessionCookie(res, token, env)
        appendAuditLog(cwd, 'auth.login.success', user.username)
        sendJson(res, 200, { user })
      } catch {
        sendJson(res, 400, { error: 'invalid_request', message: 'Invalid request.' })
      }
      return
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      applySecurityHeaders(res)
      const session = sessionFromRequest(req, env)
      clearSessionCookie(res, env)
      if (session) appendAuditLog(cwd, 'auth.logout', session.username)
      sendJson(res, 200, { ok: true })
      return
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      applySecurityHeaders(res)
      const user = sessionFromRequest(req, env)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      sendJson(res, 200, { user })
      return
    }

    if (pathname === '/api/auth/status' && req.method === 'GET') {
      applySecurityHeaders(res)
      sendJson(res, 200, { configured: isAuthConfigured(env) })
      return
    }

    // --- Protect all other /api/* ---
    if (requiresAuth(pathname)) {
      const user = sessionFromRequest(req, env)
      if (!user) {
        applySecurityHeaders(res)
        sendJson(res, 401, {
          error: 'unauthenticated',
          message: 'Sign in to use Smart VMS.',
        })
        return
      }
    }

    next()
  })
}

export function authPlugin(): Plugin {
  let authEnv: AuthEnv | null = null

  return {
    name: 'smartvms-auth',
    configResolved(config) {
      authEnv = loadAuthEnv(config.mode, config.root)
      if (!isAuthConfigured(authEnv)) {
        console.warn(
          '[auth] SMARTVMS_ADMIN_PASSWORD missing — login disabled until password is set in web/.env',
        )
      }
    },
    configureServer(server: ViteDevServer) {
      attachAuthMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachAuthMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
  }
}

/** Exporterad för axis-proxy — verifiera session innan kameraström. */
export function getSessionUser(req: IncomingMessage, mode: string, cwd: string) {
  const env = loadAuthEnv(mode, cwd)
  return { user: sessionFromRequest(req, env), env }
}
