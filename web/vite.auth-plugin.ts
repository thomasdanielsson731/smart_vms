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

type MiddlewareStack = {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
}

function attachAuthMiddleware(middlewares: MiddlewareStack, mode: string, cwd: string) {
  const env = loadAuthEnv(mode, cwd)

  middlewares.use(async (req, res, next) => {
    applySecurityHeaders(res)

    const url = req.url ?? ''
    const pathname = url.split('?')[0]

    // --- Auth routes ---
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      if (!isAuthConfigured(env)) {
        sendJson(res, 503, {
          error: 'auth_not_configured',
          message:
            'Sätt SMARTVMS_ADMIN_PASSWORD i web/.env och starta om dev-servern.',
        })
        return
      }

      if (!checkLoginRateLimit(req)) {
        sendJson(res, 429, {
          error: 'rate_limited',
          message: 'För många inloggningsförsök. Försök igen om 15 minuter.',
        })
        return
      }

      try {
        const body = (await readJsonBody(req)) as { username?: string; password?: string }
        const username = (body.username ?? '').trim()
        const password = body.password ?? ''
        const user = authenticateUser(username, password, env)
        if (!user) {
          sendJson(res, 401, { error: 'invalid_credentials', message: 'Fel användarnamn eller lösenord.' })
          return
        }
        const token = createSessionToken(user, env)
        setSessionCookie(res, token, env)
        sendJson(res, 200, { user })
      } catch {
        sendJson(res, 400, { error: 'invalid_request', message: 'Ogiltig begäran.' })
      }
      return
    }

    if (pathname === '/api/auth/logout' && req.method === 'POST') {
      clearSessionCookie(res, env)
      sendJson(res, 200, { ok: true })
      return
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const user = sessionFromRequest(req, env)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      sendJson(res, 200, { user })
      return
    }

    if (pathname === '/api/auth/status' && req.method === 'GET') {
      sendJson(res, 200, { configured: isAuthConfigured(env) })
      return
    }

    // --- Protect all other /api/* ---
    if (requiresAuth(pathname)) {
      const user = sessionFromRequest(req, env)
      if (!user) {
        sendJson(res, 401, {
          error: 'unauthenticated',
          message: 'Logga in för att använda Smart VMS.',
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
          '[auth] SMARTVMS_ADMIN_PASSWORD saknas — inloggning är avstängd tills lösenord sätts i web/.env',
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
