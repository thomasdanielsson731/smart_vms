import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { getSessionUser } from './vite.auth-plugin'

const DEFAULT_SERVER = 'http://127.0.0.1:8787'

function serverBaseUrl(): string {
  return process.env.SMARTVMS_SERVER_URL ?? DEFAULT_SERVER
}

async function proxyToServer(
  req: IncomingMessage,
  res: ServerResponse,
  targetPath: string,
): Promise<void> {
  const url = `${serverBaseUrl()}${targetPath}`
  const headers = new Headers()
  for (const [key, value] of Object.entries(req.headers)) {
    if (value && key.toLowerCase() !== 'host') {
      headers.set(key, Array.isArray(value) ? value.join(',') : value)
    }
  }

  const init: RequestInit = { method: req.method, headers }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks: Buffer[] = []
    for await (const chunk of req) chunks.push(chunk as Buffer)
    if (chunks.length > 0) init.body = Buffer.concat(chunks)
  }

  const upstream = await fetch(url, init)
  res.statusCode = upstream.status
  upstream.headers.forEach((value, key) => {
    if (key.toLowerCase() !== 'transfer-encoding') res.setHeader(key, value)
  })
  res.setHeader('Cache-Control', 'no-store')
  const body = Buffer.from(await upstream.arrayBuffer())
  res.end(body)
}

function attachServerProxy(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  },
  mode: string,
  cwd: string,
) {
  middlewares.use((req, res, next) => {
    const url = req.url ?? ''
    if (!url.startsWith('/api/vms/')) return next()

    const { user } = getSessionUser(req, mode, cwd)
    if (!user) {
      res.statusCode = 401
      res.setHeader('Content-Type', 'application/json')
      res.end(JSON.stringify({ error: 'unauthenticated', message: 'Sign in required' }))
      return
    }

    const targetPath = url.replace(/^\/api\/vms/, '/api')
    void proxyToServer(req, res, targetPath).catch(() => {
      res.statusCode = 503
      res.setHeader('Content-Type', 'application/json')
      res.end(
        JSON.stringify({
          error: 'server_unavailable',
          message: 'Phase 3 server not reachable. Start with: cd server && npm run dev',
        }),
      )
    })
  })
}

export function serverProxyPlugin(): Plugin {
  return {
    name: 'smart-vms-server-proxy',
    configureServer(server: ViteDevServer) {
      attachServerProxy(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachServerProxy(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
