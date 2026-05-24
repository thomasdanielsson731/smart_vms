import type { IncomingMessage, ServerResponse } from 'node:http'
import DigestClient from 'digest-fetch'
import { loadEnv } from 'vite'
import { getSessionUser } from '../vite.auth-plugin'
import {
  fetchAxisParamList,
  isAllowedCameraHost,
  isAxisDeviceParams,
  localhostCameraAllowed,
  pickDeviceInfo,
  pickStreamProfileLabel,
  sendJson,
} from './camera-proxy-shared'
import { resolveVapixCredentials } from './vapix-config'

export interface DiscoveredAxisDevice {
  host: string
  model: string
  serial: string
  firmware: string
  streamProfile?: string
}

const PROBE_TIMEOUT_MS = 2500
const SCAN_CONCURRENCY = 20
const DISCOVER_COOLDOWN_MS = 30_000

const PARAM_GROUPS = 'Brand,Properties,System,StreamProfile'

const discoverCooldown = new Map<string, number>()

/** Parse "192.168.68.0/24" or "192.168.68" into host list (1–254). */
export function parseScanSubnet(subnet: string): string[] | null {
  const trimmed = subnet.trim()
  const cidrMatch = trimmed.match(
    /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})(?:\.(\d{1,3}))?(?:\/(\d{1,2}))?$/,
  )
  if (!cidrMatch) return null

  const a = Number(cidrMatch[1])
  const b = Number(cidrMatch[2])
  const c = Number(cidrMatch[3])
  const prefix = Number(cidrMatch[5] ?? 24)

  if ([a, b, c].some((n) => n > 255) || prefix < 16 || prefix > 30) return null
  if (prefix !== 24) return null

  const seed = `${a}.${b}.${c}.1`
  if (!isAllowedCameraHost(seed)) return null

  const hosts: string[] = []
  for (let last = 1; last <= 254; last += 1) {
    hosts.push(`${a}.${b}.${c}.${last}`)
  }
  return hosts
}

export function subnetLabelFromIp(ip: string): string | null {
  const parts = ip.split('.').map(Number)
  if (parts.length !== 4 || parts.some((p) => p > 255)) return null
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
}

export function getServerCameraHosts(mode: string, cwd: string): string[] {
  const env = loadEnv(mode, cwd, '')
  const raw = (env.VITE_CAMERA_HOSTS ?? '').trim()
  if (!raw) return []
  return raw.split(',').map((h) => h.trim()).filter(Boolean)
}

function normalizeSubnetLabel(subnet: string): string | null {
  const hosts = parseScanSubnet(subnet)
  if (!hosts || hosts.length === 0) return null
  const parts = hosts[0].split('.')
  return `${parts[0]}.${parts[1]}.${parts[2]}.0/24`
}

/** Requires VITE_CAMERA_SUBNET or a seed IP in VITE_CAMERA_HOSTS — no silent default subnet. */
export function resolveScanSubnet(mode: string, cwd: string, querySubnet?: string | null): string | null {
  const env = loadEnv(mode, cwd, '')
  const fromEnv = (env.VITE_CAMERA_SUBNET ?? '').trim()
  const candidate = (querySubnet ?? fromEnv).trim()
  if (candidate) return normalizeSubnetLabel(candidate)

  const seeds = getServerCameraHosts(mode, cwd)
  if (seeds.length > 0) return subnetLabelFromIp(seeds[0])

  return null
}

export function hostsForScan(subnet: string): string[] {
  return parseScanSubnet(subnet) ?? []
}

async function probeAxisHost(
  client: DigestClient,
  host: string,
  allowLocalhost: boolean,
): Promise<DiscoveredAxisDevice | null> {
  if (!isAllowedCameraHost(host, { allowLocalhost })) return null

  const params = await fetchAxisParamList(client, host, PARAM_GROUPS, PROBE_TIMEOUT_MS)
  if (!params || !isAxisDeviceParams(params)) return null

  const info = pickDeviceInfo(params)
  const model = info.model?.trim() || info.brand?.trim() || 'Axis device'

  return {
    host,
    model,
    serial: info.serial?.trim() || '—',
    firmware: info.firmware?.trim() || '—',
    streamProfile: pickStreamProfileLabel(params),
  }
}

async function scanHosts(
  client: DigestClient,
  hosts: string[],
  allowLocalhost: boolean,
): Promise<DiscoveredAxisDevice[]> {
  const found: DiscoveredAxisDevice[] = []

  for (let i = 0; i < hosts.length; i += SCAN_CONCURRENCY) {
    const batch = hosts.slice(i, i + SCAN_CONCURRENCY)
    const results = await Promise.all(
      batch.map((host) => probeAxisHost(client, host, allowLocalhost)),
    )
    for (const device of results) {
      if (device) found.push(device)
    }
  }

  found.sort((a, b) => compareIp(a.host, b.host))
  return found
}

function compareIp(a: string, b: string): number {
  const pa = a.split('.').map(Number)
  const pb = b.split('.').map(Number)
  for (let i = 0; i < 4; i += 1) {
    if (pa[i] !== pb[i]) return pa[i] - pb[i]
  }
  return 0
}

export async function scanSubnetForAxisCameras(
  mode: string,
  cwd: string,
  subnet: string,
): Promise<{ subnet: string; scanned: number; devices: DiscoveredAxisDevice[] }> {
  const hosts = hostsForScan(subnet)
  if (hosts.length === 0) {
    throw new Error('invalid_subnet')
  }

  const { user, password } = resolveVapixCredentials(mode, cwd)
  if (!user || !password) {
    throw new Error('missing_credentials')
  }

  const client = new DigestClient(user, password)
  const devices = await scanHosts(client, hosts, localhostCameraAllowed(mode, cwd))

  return { subnet, scanned: hosts.length, devices }
}

function checkDiscoverCooldown(username: string): boolean {
  const last = discoverCooldown.get(username) ?? 0
  if (Date.now() - last < DISCOVER_COOLDOWN_MS) return false
  discoverCooldown.set(username, Date.now())
  return true
}

/** GET /api/camera/discover?subnet=192.168.68.0/24 — admin only */
export async function handleCameraDiscover(
  req: IncomingMessage,
  res: ServerResponse,
  mode: string,
  cwd: string,
  querySubnet?: string | null,
): Promise<void> {
  const { user: sessionUser } = getSessionUser(req, mode, cwd)
  if (!sessionUser) {
    sendJson(res, 401, { error: 'unauthenticated', message: 'Sign in to scan for cameras.' })
    return
  }
  if (sessionUser.role !== 'admin') {
    sendJson(res, 403, {
      error: 'forbidden',
      message: 'Administrator access required for LAN camera discovery.',
    })
    return
  }

  if (!checkDiscoverCooldown(sessionUser.username)) {
    sendJson(res, 429, {
      error: 'rate_limited',
      message: 'Wait 30 seconds between LAN scans.',
    })
    return
  }

  const subnet = resolveScanSubnet(mode, cwd, querySubnet)
  if (!subnet || hostsForScan(subnet).length === 0) {
    sendJson(res, 400, {
      error: 'invalid_subnet',
      message:
        'Set VITE_CAMERA_SUBNET or VITE_CAMERA_HOSTS in web/.env (private /24), or pass ?subnet=192.168.x.0/24',
    })
    return
  }

  try {
    const result = await scanSubnetForAxisCameras(mode, cwd, subnet)
    sendJson(res, 200, result)
  } catch (err) {
    if (err instanceof Error && err.message === 'missing_credentials') {
      sendJson(res, 503, {
        error: 'missing_credentials',
        message:
          'Set shared camera password under Settings or AXIS_VAPIX_USER/PASSWORD in web/.env',
      })
      return
    }
    sendJson(res, 500, {
      error: 'scan_failed',
      message: err instanceof Error ? err.message : 'Scan failed',
    })
  }
}
