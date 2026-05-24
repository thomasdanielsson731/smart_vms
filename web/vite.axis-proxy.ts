import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import DigestClient from 'digest-fetch'
import { getSessionUser } from './vite.auth-plugin'
import { resolveVapixCredentials } from './server/vapix-config'

function isAllowedHost(host: string): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false
  const parts = host.split('.').map(Number)
  if (parts.some((p) => p > 255)) return false
  if (parts[0] === 10) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (host === '127.0.0.1') return true
  return false
}

type StreamKind = 'mjpg' | 'snapshot'

function axisUrl(host: string, kind: StreamKind): string {
  if (kind === 'mjpg') {
    return `http://${host}/axis-cgi/mjpg/video.cgi?resolution=640x480&camera=1`
  }
  return `http://${host}/axis-cgi/jpg/image.cgi?resolution=640x480&camera=1`
}

function attachAxisProxy(
  middlewares: { use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void },
  mode: string,
  cwd: string,
) {
  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const match = url.match(/^\/api\/camera\/([^/]+)\/(mjpg|snapshot)(?:\?.*)?$/)
    if (!match) return next()

    const host = decodeURIComponent(match[1])
    const kind = match[2] as StreamKind
    const query = new URL(url, 'http://local').searchParams
    const vapixUserOverride = query.get('vapixUser') ?? undefined

    if (!isAllowedHost(host)) {
      res.statusCode = 403
      res.end('Host not allowed')
      return
    }

    const { user: sessionUser } = getSessionUser(req, mode, cwd)
    if (!sessionUser) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'unauthenticated', message: 'Logga in för live video.' }))
      return
    }

    const { user: vapixUser, password: vapixPass } = resolveVapixCredentials(
      mode,
      cwd,
      vapixUserOverride,
    )

    if (!vapixUser || !vapixPass) {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'missing_credentials',
          message:
            'Sätt gemensamt kamerolösenord under Inställningar eller AXIS_VAPIX_USER/PASSWORD i web/.env',
        }),
      )
      return
    }

    try {
      const client = new DigestClient(vapixUser, vapixPass)
      const target = axisUrl(host, kind)
      const response = await client.fetch(target, { method: 'GET' })

      if (!response.ok) {
        res.statusCode = response.status
        res.end(`Camera returned ${response.status}`)
        return
      }

      const contentType = response.headers.get('content-type')
      if (contentType) res.setHeader('Content-Type', contentType)

      if (kind === 'snapshot') {
        res.setHeader('Cache-Control', 'no-store')
        const buf = Buffer.from(await response.arrayBuffer())
        res.end(buf)
        return
      }

      res.setHeader('Cache-Control', 'no-store')
      const body = response.body
      if (!body) {
        res.statusCode = 502
        res.end('Empty body')
        return
      }

      const reader = body.getReader()
      const pump = async () => {
        while (true) {
          const { done, value } = await reader.read()
          if (done) break
          res.write(Buffer.from(value))
        }
        res.end()
      }
      req.on('close', () => reader.cancel().catch(() => {}))
      await pump()
    } catch (err) {
      if (!res.headersSent) {
        res.statusCode = 502
        res.setHeader('Content-Type', 'application/json')
        res.end(
          JSON.stringify({
            error: 'proxy_failed',
            message: err instanceof Error ? err.message : 'Proxy error',
          }),
        )
      }
    }
  })
}

export function axisCameraProxyPlugin(): Plugin {
  return {
    name: 'axis-camera-proxy',
    configureServer(server: ViteDevServer) {
      attachAxisProxy(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachAxisProxy(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
