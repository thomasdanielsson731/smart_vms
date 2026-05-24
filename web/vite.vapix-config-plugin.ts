import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { loadAuthEnv, readJsonBody, sendJson, sessionFromRequest } from './server/auth'
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
      sendJson(res, 401, { error: 'unauthenticated' })
      return
    }

    if (req.method === 'GET') {
      sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      return
    }

    if (session.role !== 'admin') {
      sendJson(res, 403, { error: 'forbidden', message: 'Endast administratör kan ändra kameruppgifter.' })
      return
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      try {
        const body = (await readJsonBody(req)) as { user?: string; password?: string }
        const user = (body.user ?? '').trim()
        let password = body.password ?? ''
        const stored = getStoredCredentials(cwd)
        if (!password && stored?.password) password = stored.password
        if (!user || !password) {
          sendJson(res, 400, {
            error: 'invalid_request',
            message: 'Ange både VAPIX-användare och gemensamt lösenord.',
          })
          return
        }
        saveVapixCredentials(cwd, { user, password })
        sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      } catch {
        sendJson(res, 400, { error: 'invalid_request', message: 'Ogiltig begäran.' })
      }
      return
    }

    if (req.method === 'DELETE') {
      clearVapixCredentials(cwd)
      sendJson(res, 200, vapixConfigPublicView(mode, cwd))
      return
    }

    sendJson(res, 405, { error: 'method_not_allowed' })
  })
}

export function vapixConfigPlugin(): Plugin {
  return {
    name: 'smartvms-vapix-config',
    configureServer(server: ViteDevServer) {
      initVapixConfig(server.config.root)
      attachVapixConfigMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      initVapixConfig(server.config.root)
      attachVapixConfigMiddleware(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
