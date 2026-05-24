import type { Plugin, PreviewServer, ViteDevServer } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import {
  isAllowedCameraHost,
  parseAxisParamList,
  pickDeviceInfo,
  prepareCameraWebHtml,
  readRequestBody,
  resolveCameraProxyAuth,
  forwardProxyResponseHeaders,
  rewriteCameraAbsoluteUrls,
  proxyWebBasePath,
  sendJson,
} from './server/camera-proxy-shared'

type StreamKind = 'mjpg' | 'snapshot'

function axisStreamUrl(host: string, kind: StreamKind): string {
  if (kind === 'mjpg') {
    return `http://${host}/axis-cgi/mjpg/video.cgi?resolution=640x480&camera=1`
  }
  return `http://${host}/axis-cgi/jpg/image.cgi?resolution=640x480&camera=1`
}

function cameraWebTargets(host: string, cameraPath: string, query: string): string[] {
  const path = `${cameraPath}${query}`
  return [`http://${host}${path}`, `https://${host}${path}`]
}

async function fetchCameraWebPage(
  auth: NonNullable<ReturnType<typeof resolveCameraProxyAuth>>,
  cameraPath: string,
  query: string,
  method: string,
  body: Buffer | undefined,
  forwardHeaders: Record<string, string>,
): Promise<Response> {
  let lastError: unknown
  for (const target of cameraWebTargets(auth.host, cameraPath, query)) {
    try {
      const response = await auth.client.fetch(target, {
        method,
        body: body?.length ? body : undefined,
        headers: forwardHeaders,
        redirect: 'manual',
      })
      if (response.status >= 500 && target.startsWith('http://')) continue
      return response
    } catch (err) {
      lastError = err
      if (target.startsWith('http://')) continue
      throw err
    }
  }
  throw lastError instanceof Error ? lastError : new Error('Camera web fetch failed')
}

function rewriteCameraWebAsset(text: string, host: string): string {
  const base = proxyWebBasePath(host)
  return rewriteCameraAbsoluteUrls(text, host, base)
}

function attachCameraProxy(
  middlewares: {
    use: (fn: (req: IncomingMessage, res: ServerResponse, next: () => void) => void) => void
  },
  mode: string,
  cwd: string,
) {
  middlewares.use(async (req, res, next) => {
    const url = req.url ?? ''
    const pathname = url.split('?')[0]
    const query = url.includes('?') ? url.slice(url.indexOf('?')) : ''

    // --- Stream connectivity test ---
    const testMatch = pathname.match(/^\/api\/camera\/([^/]+)\/stream-test$/)
    if (testMatch && req.method === 'GET') {
      const host = decodeURIComponent(testMatch[1])
      const search = new URL(url, 'http://local').searchParams
      const vapixUserOverride = search.get('vapixUser') ?? undefined
      const auth = resolveCameraProxyAuth(req, res, mode, cwd, host, vapixUserOverride)
      if (!auth) return

      try {
        const target = axisStreamUrl(host, 'snapshot')
        const response = await auth.client.fetch(target, { method: 'GET', signal: AbortSignal.timeout(8000) })

        if (response.status === 401 || response.status === 403) {
          sendJson(res, 200, {
            ok: false,
            code: 'auth_failed',
            host,
            message: `Camera returned ${response.status} — wrong VAPIX user or password.`,
          })
          return
        }

        if (!response.ok) {
          sendJson(res, 200, {
            ok: false,
            code: 'camera_error',
            host,
            message: `Camera returned HTTP ${response.status}.`,
          })
          return
        }

        sendJson(res, 200, { ok: true, code: 'ok', host, message: 'Snapshot OK' })
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Proxy error'
        const unreachable =
          /fetch failed|ECONNREFUSED|ETIMEDOUT|timeout|ENOTFOUND|network/i.test(msg)
        sendJson(res, 200, {
          ok: false,
          code: unreachable ? 'unreachable' : 'proxy_failed',
          host,
          message: unreachable
            ? `Cannot reach ${host} on the network.`
            : msg,
        })
      }
      return
    }

    // --- Device info (JSON) ---
    const infoMatch = pathname.match(/^\/api\/camera\/([^/]+)\/device-info$/)
    if (infoMatch && req.method === 'GET') {
      const host = decodeURIComponent(infoMatch[1])
      const auth = resolveCameraProxyAuth(req, res, mode, cwd, host)
      if (!auth) return

      try {
        const target =
          `http://${host}/axis-cgi/param.cgi?action=list&group=Brand,Network,Properties,System`
        const response = await auth.client.fetch(target, { method: 'GET' })
        if (!response.ok) {
          sendJson(res, response.status, {
            error: 'camera_error',
            message: `Camera returned ${response.status}`,
          })
          return
        }
        const text = await response.text()
        const params = parseAxisParamList(text)
        sendJson(res, 200, pickDeviceInfo(params))
      } catch (err) {
        sendJson(res, 502, {
          error: 'proxy_failed',
          message: err instanceof Error ? err.message : 'Proxy error',
        })
      }
      return
    }

    // --- Embedded web UI proxy (GET + POST for login/forms) ---
    const webMatch = pathname.match(/^\/api\/camera\/([^/]+)\/web(?:\/(.*))?$/)
    if (webMatch && ['GET', 'HEAD', 'POST', 'PUT', 'DELETE'].includes(req.method ?? 'GET')) {
      const host = decodeURIComponent(webMatch[1])
      const subPath = webMatch[2] ?? ''
      const auth = resolveCameraProxyAuth(req, res, mode, cwd, host)
      if (!auth) return

      const cameraPath = subPath ? `/${subPath}` : '/'
      const method = req.method ?? 'GET'

      try {
        let body: Buffer | undefined
        if (method !== 'GET' && method !== 'HEAD') {
          body = await readRequestBody(req)
        }

        const forwardHeaders: Record<string, string> = {}
        const contentType = req.headers['content-type']
        if (contentType && typeof contentType === 'string') {
          forwardHeaders['Content-Type'] = contentType
        }

        const response = await fetchCameraWebPage(
          auth,
          cameraPath,
          query,
          method,
          body,
          forwardHeaders,
        )

        const resContentType = response.headers.get('content-type') ?? 'application/octet-stream'
        res.statusCode = response.status
        forwardProxyResponseHeaders(res, response, host)

        if (resContentType.includes('text/html')) {
          const html = await response.text()
          res.setHeader('Content-Type', resContentType)
          res.end(prepareCameraWebHtml(html, host))
          return
        }

        if (
          resContentType.includes('javascript') ||
          resContentType.includes('text/css') ||
          resContentType.includes('application/json')
        ) {
          const text = await response.text()
          res.setHeader('Content-Type', resContentType)
          res.end(rewriteCameraWebAsset(text, host))
          return
        }

        const buf = Buffer.from(await response.arrayBuffer())
        if (!res.hasHeader('Content-Type')) {
          res.setHeader('Content-Type', resContentType)
        }
        res.end(buf)
      } catch (err) {
        if (!res.headersSent) {
          sendJson(res, 502, {
            error: 'proxy_failed',
            message: err instanceof Error ? err.message : 'Proxy error',
          })
        }
      }
      return
    }

    // --- MJPEG / snapshot streams ---
    const streamMatch = pathname.match(/^\/api\/camera\/([^/]+)\/(mjpg|snapshot)$/)
    if (!streamMatch || req.method !== 'GET') return next()

    const host = decodeURIComponent(streamMatch[1])
    const kind = streamMatch[2] as StreamKind
    const search = new URL(url, 'http://local').searchParams
    const vapixUserOverride = search.get('vapixUser') ?? undefined

    if (!isAllowedCameraHost(host)) {
      res.statusCode = 403
      res.end('Host not allowed')
      return
    }

    const auth = resolveCameraProxyAuth(req, res, mode, cwd, host, vapixUserOverride)
    if (!auth) return

    try {
      const target = axisStreamUrl(host, kind)
      const response = await auth.client.fetch(target, { method: 'GET' })

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
        sendJson(res, 502, {
          error: 'proxy_failed',
          message: err instanceof Error ? err.message : 'Proxy error',
        })
      }
    }
  })
}

export function axisCameraProxyPlugin(): Plugin {
  return {
    name: 'axis-camera-proxy',
    configureServer(server: ViteDevServer) {
      attachCameraProxy(server.middlewares, server.config.mode, server.config.root)
    },
    configurePreviewServer(server: PreviewServer) {
      attachCameraProxy(server.middlewares, server.config.mode, server.config.root)
    },
  }
}
