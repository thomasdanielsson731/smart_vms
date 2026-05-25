import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import fs from 'node:fs'
import { getSessionUser } from './vite.auth-plugin'
import { sendJson } from './server/camera-proxy-shared'
import { getRecordingService } from './server/recording/service'
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

function attachRecordingRoutes(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  },
  mode: string,
  cwd: string,
) {
  const service = getRecordingService(mode, cwd)

  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]

    if (pathname === '/api/recording/cameras' && req.method === 'PUT') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user || user.role !== 'admin') {
        sendJson(res, 403, { error: 'forbidden' })
        return
      }
      try {
        const body = await readJsonBody<{ cameras: ServerCameraRef[] }>(req)
        service.syncCameras(body.cameras ?? [])
        sendJson(res, 200, { ok: true })
      } catch {
        sendJson(res, 400, { error: 'invalid_body' })
      }
      return
    }

    if (pathname === '/api/recording/segments' && req.method === 'GET') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      const params = new URLSearchParams(url.split('?')[1] ?? '')
      const from = new Date(params.get('from') ?? Date.now() - 48 * 3600_000)
      const to = new Date(params.get('to') ?? Date.now())
      const cameraId = params.get('cameraId') ?? undefined
      sendJson(res, 200, { segments: service.listSegments(from, to, cameraId) })
      return
    }

    if (pathname === '/api/recording/usage' && req.method === 'GET') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      const settings = {
        maxRecordingGiB: 100,
        maxClipsGiB: 50,
        maxRetentionDays: 30,
        warnAtPercent: 85,
        onLimitReached: 'delete_oldest' as const,
      }
      const usage = service.getUsage(settings)
      sendJson(res, 200, {
        ...usage,
        recordingPercent: Math.min(100, (usage.recordingUsedGiB / settings.maxRecordingGiB) * 100),
        clipsPercent: 0,
        isOverQuota: usage.recordingUsedGiB >= settings.maxRecordingGiB,
        isWarning:
          usage.recordingUsedGiB / settings.maxRecordingGiB >= settings.warnAtPercent / 100,
      })
      return
    }

    const frameMatch = pathname.match(/^\/api\/recording\/frame\/([^/]+)$/)
    if (frameMatch && req.method === 'GET') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      const filePath = service.getFramePath(decodeURIComponent(frameMatch[1]!))
      if (!filePath || !fs.existsSync(filePath)) {
        sendJson(res, 404, { error: 'not_found' })
        return
      }
      res.statusCode = 200
      res.setHeader('Content-Type', 'image/jpeg')
      fs.createReadStream(filePath).pipe(res)
      return
    }

    const nearestMatch = pathname.match(/^\/api\/recording\/nearest$/)
    if (nearestMatch && req.method === 'GET') {
      const { user } = getSessionUser(req, mode, cwd)
      if (!user) {
        sendJson(res, 401, { error: 'unauthenticated' })
        return
      }
      const params = new URLSearchParams(url.split('?')[1] ?? '')
      const cameraId = params.get('cameraId')
      const at = params.get('at')
      if (!cameraId || !at) {
        sendJson(res, 400, { error: 'missing_params' })
        return
      }
      const frame = service.getNearestFrame(cameraId, new Date(at))
      sendJson(res, 200, { frame })
      return
    }

    next()
  })
}

export function recordingPlugin(): Plugin {
  return {
    name: 'smart-vms-recording',
    configureServer(server: ViteDevServer) {
      attachRecordingRoutes(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachRecordingRoutes(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
