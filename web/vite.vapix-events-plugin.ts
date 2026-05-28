import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { getSessionUser } from './vite.auth-plugin'
import { sendJson } from './server/camera-proxy-shared'
import { getVapixEventIngestService } from './server/vapix-event-ingest-service'
import type { ServerCameraRef } from './server/recording/store'

function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    req.on('data', (c) => chunks.push(c))
    req.on('end', () => {
      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString('utf8')) as T)
      } catch (e) {
        reject(e)
      }
    })
    req.on('error', reject)
  })
}

function attachVapixEventRoutes(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  },
  mode: string,
  cwd: string,
) {
  const service = getVapixEventIngestService(mode, cwd)

  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]

    if (pathname === '/api/vapix-events/status' && req.method === 'GET') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      sendJson(res, 200, { status: service.getStatus() })
      return
    }

    if (pathname === '/api/vapix-events/cameras' && req.method === 'PUT') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user || user.role !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' })
        return
      }
      try {
        const body = await readJsonBody<{ cameras: ServerCameraRef[] }>(req)
        service.syncCameras(body.cameras ?? [])
        sendJson(res, 200, { ok: true, status: service.getStatus() })
      } catch {
        sendJson(res, 400, { error: 'invalid_body' })
      }
      return
    }

    next()
  })
}

export function vapixEventsPlugin(): Plugin {
  return {
    name: 'smart-vms-vapix-events',
    configureServer(server: ViteDevServer) {
      attachVapixEventRoutes(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachVapixEventRoutes(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
