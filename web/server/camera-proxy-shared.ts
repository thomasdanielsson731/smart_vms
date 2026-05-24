import type { IncomingMessage, ServerResponse } from 'node:http'
import DigestClient from 'digest-fetch'
import { loadEnv } from 'vite'
import { getSessionUser } from '../vite.auth-plugin'
import type { UserRole } from './auth'
import { resolveVapixCredentials } from './vapix-config'

const MAX_PROXY_BODY_BYTES = 5 * 1024 * 1024

export function readRequestBody(
  req: IncomingMessage,
  maxBytes = MAX_PROXY_BODY_BYTES,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    let total = 0
    req.on('data', (chunk: Buffer) => {
      total += chunk.length
      if (total > maxBytes) {
        req.destroy()
        reject(new Error('body_too_large'))
        return
      }
      chunks.push(chunk)
    })
    req.on('end', () => resolve(Buffer.concat(chunks)))
    req.on('error', reject)
  })
}

export interface CameraHostAllowOptions {
  /** Dev-only: set SMARTVMS_ALLOW_LOCALHOST_CAMERA=true in web/.env */
  allowLocalhost?: boolean
}

export function isAllowedCameraHost(host: string, options?: CameraHostAllowOptions): boolean {
  if (!/^\d{1,3}(\.\d{1,3}){3}$/.test(host)) return false
  const parts = host.split('.').map(Number)
  if (parts.some((p) => p > 255)) return false
  if (parts[0] === 10) return true
  if (parts[0] === 192 && parts[1] === 168) return true
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true
  if (host === '127.0.0.1') return options?.allowLocalhost === true
  return false
}

export function localhostCameraAllowed(mode: string, cwd: string): boolean {
  const env = loadEnv(mode, cwd, '')
  return env.SMARTVMS_ALLOW_LOCALHOST_CAMERA === 'true'
}

export interface CameraProxyAuthOptions {
  requireAdmin?: boolean
  vapixUserOverride?: string
}

export interface CameraProxyAuth {
  client: DigestClient
  host: string
  role: UserRole
}

export function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

/** Session + VAPIX credentials for camera proxy routes */
export function resolveCameraProxyAuth(
  req: IncomingMessage,
  res: ServerResponse,
  mode: string,
  cwd: string,
  host: string,
  options?: CameraProxyAuthOptions | string,
): CameraProxyAuth | null {
  const opts: CameraProxyAuthOptions =
    typeof options === 'string' ? { vapixUserOverride: options } : (options ?? {})

  if (!isAllowedCameraHost(host, { allowLocalhost: localhostCameraAllowed(mode, cwd) })) {
    sendJson(res, 403, { error: 'host_not_allowed', message: 'Camera host not allowed.' })
    return null
  }

  const { user: sessionUser } = getSessionUser(req, mode, cwd)
  if (!sessionUser) {
    sendJson(res, 401, { error: 'unauthenticated', message: 'Sign in to access cameras.' })
    return null
  }

  if (opts.requireAdmin && sessionUser.role !== 'admin') {
    sendJson(res, 403, {
      error: 'forbidden',
      message: 'Administrator access required for this camera operation.',
    })
    return null
  }

  const vapixUserOverride = opts.vapixUserOverride
  if (vapixUserOverride && sessionUser.role !== 'admin') {
    sendJson(res, 403, {
      error: 'forbidden',
      message: 'Only administrators can override VAPIX user.',
    })
    return null
  }

  const { user: vapixUser, password: vapixPass } = resolveVapixCredentials(
    mode,
    cwd,
    vapixUserOverride,
  )

  if (!vapixUser || !vapixPass) {
    sendJson(res, 503, {
      error: 'missing_credentials',
      message:
        'Set shared camera password under Settings or AXIS_VAPIX_USER/PASSWORD in web/.env',
    })
    return null
  }

  return { client: new DigestClient(vapixUser, vapixPass), host, role: sessionUser.role }
}

export function proxyWebBasePath(host: string): string {
  return `/api/camera/${encodeURIComponent(host)}/web`
}

function hostOriginPattern(host: string): RegExp {
  const escaped = host.replace(/\./g, '\\.')
  return new RegExp(`https?:\\/\\/${escaped}(?::\\d+)?`, 'gi')
}

/** Rewrite camera-origin URLs so embedded Axis JS stays on the Smart VMS proxy path */
export function rewriteCameraAbsoluteUrls(content: string, host: string, base: string): string {
  const baseNoTrail = base.replace(/\/$/, '')
  return content.replace(hostOriginPattern(host), baseNoTrail)
}

/** Rewrite root-relative URLs in HTML so navigation stays inside the proxy iframe */
export function rewriteCameraWebHtml(html: string, host: string): string {
  const base = proxyWebBasePath(host)
  let out = rewriteCameraAbsoluteUrls(html, host, base)
  out = out
    .replace(/(\s(?:href|src|action)=["'])\/(?!\/)/gi, `$1${base}/`)
    .replace(
      /(\s(?:href|src|action)=["'])((?!https?:|\/api\/|#|mailto:|javascript:|data:)[^"']+)/gi,
      `$1${base}/$2`,
    )
    .replace(/url\(\s*\/(?!\/)/gi, `url(${base}/`)
  const hostEsc = host.replace(/\./g, '\\.')
  out = out.replace(
    new RegExp(`(href|src|action)=(["'])//${hostEsc}`, 'gi'),
    `$1=$2${base.replace(/\/$/, '')}`,
  )
  return out
}

/** Inject base URL + fetch/XHR shim so Axis JS API calls stay on the proxy path */
export function prepareCameraWebHtml(html: string, host: string): string {
  const base = proxyWebBasePath(host)
  const shim = `<base href="${base}/"><script>(function(){var B="${base}",H="${host}";function rp(u){if(typeof u!=="string")return u;if(u.startsWith("/api/"))return u;var lo=u.toLowerCase(),hp="http://"+H,hs="https://"+H;if(lo.indexOf(hp)===0||lo.indexOf(hs)===0){var i=u.indexOf("/",8);return B+(i>=0?u.slice(i):"/")}if(u.startsWith("/"))return B+u;if(u.startsWith("http://")||u.startsWith("https://"))return u;return u}var f=window.fetch;if(f)window.fetch=function(u,o){if(typeof u==="string")return f.call(this,rp(u),o);if(u&&u.url){try{return f.call(this,new Request(rp(u.url),u),o)}catch(e){}}return f.call(this,u,o)};var xo=XMLHttpRequest.prototype.open;XMLHttpRequest.prototype.open=function(m,u){arguments[1]=rp(u);return xo.apply(this,arguments)};})();</script>`
  let out = rewriteCameraWebHtml(html, host)
  if (/<head[^>]*>/i.test(out)) {
    out = out.replace(/<head[^>]*>/i, (m) => `${m}${shim}`)
  } else {
    out = shim + out
  }
  return out
}

export function rewriteLocationHeader(location: string, host: string): string {
  const base = proxyWebBasePath(host)
  const originMatch = location.match(hostOriginPattern(host))
  if (originMatch) {
    const idx = location.indexOf(originMatch[0])
    const rest = location.slice(idx + originMatch[0].length) || '/'
    return `${base}${rest.startsWith('/') ? rest : `/${rest}`}`
  }
  if (location.startsWith('/')) return `${base}${location}`
  return location
}

export function rewriteSetCookieHeader(cookie: string, host: string): string {
  const base = proxyWebBasePath(host)
  let out = cookie.replace(/;\s*domain=[^;]*/gi, '')
  if (/;\s*path=/i.test(out)) {
    out = out.replace(/;\s*path=[^;]*/i, `; path=${base}/`)
  } else {
    out += `; path=${base}/`
  }
  return out
}

export function forwardProxyResponseHeaders(
  res: ServerResponse,
  response: Response,
  host: string,
): void {
  stripFrameBlockingHeaders(res)
  const setCookies =
    typeof response.headers.getSetCookie === 'function'
      ? response.headers.getSetCookie()
      : null

  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase()
    if (lower === 'transfer-encoding' || lower === 'connection') return
    if (lower === 'location') {
      res.setHeader('Location', rewriteLocationHeader(value, host))
      return
    }
    if (lower === 'set-cookie') {
      if (setCookies && setCookies.length > 1) return
      res.setHeader('Set-Cookie', rewriteSetCookieHeader(value, host))
      return
    }
    if (lower === 'content-security-policy' || lower === 'x-frame-options') return
    res.setHeader(key, value)
  })

  if (setCookies && setCookies.length > 1) {
    res.setHeader('Set-Cookie', setCookies.map((c) => rewriteSetCookieHeader(c, host)))
  }

  res.setHeader('Cache-Control', 'no-store')
}

export function stripFrameBlockingHeaders(res: ServerResponse): void {
  res.removeHeader?.('X-Frame-Options')
  res.removeHeader?.('Content-Security-Policy')
}

export function parseAxisParamList(text: string): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eq = trimmed.indexOf('=')
    if (eq === -1) continue
    out[trimmed.slice(0, eq)] = trimmed.slice(eq + 1)
  }
  return out
}

export function normalizeCameraHost(host: string): string {
  const parts = host.trim().split('.')
  if (parts.length !== 4) return host.trim()
  return parts.map((p) => String(Number(p))).join('.')
}

export async function fetchAxisParamList(
  client: DigestClient,
  host: string,
  group: string,
  timeoutMs = 8000,
): Promise<Record<string, string> | null> {
  const path = `/axis-cgi/param.cgi?action=list&group=${encodeURIComponent(group)}`
  for (const scheme of ['http', 'https'] as const) {
    try {
      const response = await client.fetch(`${scheme}://${host}${path}`, {
        method: 'GET',
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (!response.ok) continue
      const text = await response.text()
      const params = parseAxisParamList(text)
      if (Object.keys(params).length === 0) continue
      return params
    } catch {
      if (scheme === 'http') continue
    }
  }
  return null
}

export function pickStreamProfileLabel(params: Record<string, string>): string | undefined {
  for (const [key, value] of Object.entries(params)) {
    if (/^root\.StreamProfile\.S\d+\.Name$/i.test(key) && value.trim()) {
      return value.trim()
    }
  }
  const resolution = params['root.Properties.Image.Resolution']?.trim()
  return resolution || undefined
}

export function isAxisDeviceParams(params: Record<string, string>): boolean {
  const brand = (params['root.Brand.Brand'] ?? '').trim().toUpperCase()
  if (brand === 'AXIS') return true
  const prod = (params['root.Brand.ProdNbr'] ?? params['root.Brand.ProdShort'] ?? '')
    .trim()
    .toUpperCase()
  return prod.startsWith('AXIS ')
}

export function pickDeviceInfo(params: Record<string, string>) {
  return {
    brand: params['root.Brand.Brand'] ?? params['root.Brand.ProdShort'],
    model: params['root.Brand.ProdShort'] ?? params['root.Brand.ProdNbr'],
    firmware: params['root.Properties.Firmware.Version'] ?? params['root.Firmware.Version'],
    serial: params['root.Properties.System.SerialNumber'] ?? params['root.System.SerialNumber'],
    ip: params['root.Network.Broadcast IPv4 Address'] ?? params['root.Network.eth0.IPAddress'],
    mac: params['root.Network.eth0.MACAddress'],
  }
}

/** Device info for browser API — omits MAC (topology fingerprint). */
export function pickPublicDeviceInfo(params: Record<string, string>) {
  const info = pickDeviceInfo(params)
  const streamProfile = pickStreamProfileLabel(params)
  return {
    brand: info.brand,
    model: info.model,
    firmware: info.firmware,
    serial: info.serial,
    ip: info.ip,
    ...(streamProfile ? { streamProfile } : {}),
  }
}

export interface AxisAcapApplication {
  name: string
  niceName?: string
  vendor?: string
  version?: string
  status?: string
  license?: string
}

function normalizeAcapEntry(raw: Record<string, unknown>): AxisAcapApplication {
  const name =
    String(raw.Name ?? raw.name ?? raw.Application ?? raw.application ?? '').trim() || 'unknown'
  return {
    name,
    niceName: String(raw.NiceName ?? raw.niceName ?? raw.DisplayName ?? raw.displayName ?? '').trim() || undefined,
    vendor: String(raw.Vendor ?? raw.vendor ?? '').trim() || undefined,
    version: String(raw.Version ?? raw.version ?? '').trim() || undefined,
    status: String(raw.Status ?? raw.status ?? raw.State ?? raw.state ?? '').trim() || undefined,
    license: String(raw.License ?? raw.license ?? '').trim() || undefined,
  }
}

/** Parse Axis ACAP list responses (JSON API or legacy text). */
export function parseAcapListResponse(text: string): AxisAcapApplication[] {
  const trimmed = text.trim()
  if (!trimmed) return []

  if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
    try {
      const json = JSON.parse(trimmed) as Record<string, unknown>
      const data = (json.data ?? json) as Record<string, unknown>
      const list =
        data.applicationList ??
        data.applications ??
        data.Applications ??
        (Array.isArray(json) ? json : null)
      if (Array.isArray(list)) {
        return list
          .filter((item): item is Record<string, unknown> => item != null && typeof item === 'object')
          .map((item) => normalizeAcapEntry(item))
          .filter((app) => app.name !== 'unknown')
      }
    } catch {
      /* fall through to text parser */
    }
  }

  const apps: AxisAcapApplication[] = []
  for (const line of trimmed.split('\n')) {
    const eq = line.indexOf('=')
    if (eq === -1) continue
    const key = line.slice(0, eq).trim()
    const value = line.slice(eq + 1).trim()
    if (!/^applications?$/i.test(key) || !value) continue
    for (const part of value.split(',')) {
      const name = part.trim()
      if (name) apps.push({ name, status: 'unknown' })
    }
  }
  return apps
}

export async function fetchAxisAcaps(
  client: DigestClient,
  host: string,
  timeoutMs = 8000,
): Promise<AxisAcapApplication[]> {
  const controlBody = JSON.stringify({
    apiVersion: '1.0',
    method: 'getApplicationList',
    params: {},
  })

  for (const scheme of ['http', 'https'] as const) {
    try {
      const controlRes = await client.fetch(`${scheme}://${host}/axis-cgi/applications/control.cgi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: controlBody,
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (controlRes.ok) {
        const apps = parseAcapListResponse(await controlRes.text())
        if (apps.length > 0) return apps
      }

      const listRes = await client.fetch(`${scheme}://${host}/axis-cgi/applications/list.cgi`, {
        method: 'GET',
        signal: AbortSignal.timeout(timeoutMs),
      })
      if (listRes.ok) {
        const apps = parseAcapListResponse(await listRes.text())
        if (apps.length > 0) return apps
      }
    } catch {
      if (scheme === 'http') continue
    }
  }

  return []
}
