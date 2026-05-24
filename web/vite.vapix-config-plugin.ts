import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadAuthEnv, readJsonBody, sendJson, sessionFromRequest } from './server/auth'
import { appendAuditLog } from './server/audit-log'
import {
  clearVapixCredentials,
  getStoredCredentials,
  initVapixConfig,
  saveVapixCredentials,
  vapixConfigPublicView,
} from './server/vapix-config'

type MiddlewareStack = {
  use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
}

function attachVapixConfigMiddleware(middlewares: MiddlewareStack, mode: string, cwd: string) {
  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]

    if (pathname !== '/api/config/vapix') return next()

    const session = sessionFromRequest(req, loadAuthEnv(mode, cwd))
    if (!session) {
      sendJson(res, 401, {
        error: 'unauthenticated',
        message: 'Sign in again to manage camera credentials.',
      })
      return
    }

    if (req.method === 'GET') {
      sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      return
    }

    if (session.role !== 'admin') {
      sendJson(res, 403, {
        error: 'forbidden',
        message: 'Only administrators can change camera credentials.',
      })
      return
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as { user?: string; password?: string }
        const user = (body.user ?? '').trim()
        let password = body.password ?? ''
        const stored = getStoredCredentials(mode, cwd)
        if (!password && stored?.password) password = stored.password
        if (!user || !password) {
          sendJson(res, 400, {
            error: 'invalid_request',
            message: 'Enter both VAPIX user and shared password.',
          })
          return
        }
        saveVapixCredentials(cwd, mode, { user, password })
        appendAuditLog(cwd, 'vapix.credentials.saved', session.username, { user })
        sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Could not save camera credentials on the server.'
        sendJson(res, 500, { error: 'save_failed', message })
      }
      return
    }

    if (req.method === 'DELETE') {
      clearVapixCredentials(cwd)
      appendAuditLog(cwd, 'vapix.credentials.cleared', session.username)
      sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      return
    }

    sendJson(res, 405, { error: 'method_not_allowed', message: 'Method not allowed.' })
  })
}

export function vapixConfigPlugin(): Plugin {
  return {
    name: 'smartvms-vapix-config',
    configureServer(server: ViteDevServer) {
      initVapixConfig(server.config.mode, server.config.root)
      attachVapixConfigMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      initVapixConfig(server.config.mode, server.config.root)
      attachVapixConfigMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
