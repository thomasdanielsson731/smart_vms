import type { DiscoveredCamera } from '@/types/onboarding'
import { getEnvCameraHosts, normalizeCameraHost } from '@/lib/camera-hosts-storage'
import { cameraDeviceInfoUrl, cameraDiscoverUrl } from '@/lib/camera-web'

export type DiscoveryErrorCode =
  | 'unauthenticated'
  | 'missing_credentials'
  | 'scan_failed'
  | 'network'

export interface DiscoveryResult {
  devices: DiscoveredCamera[]
  subnet?: string
  scanned?: number
  error?: string
  errorCode?: DiscoveryErrorCode
}

export interface CameraMetadataProbe {
  host: string
  model: string
  serial: string
  firmware: string
  streamProfile?: string
}

export function mapDiscoveryHttpError(
  status: number,
  body: { error?: string; message?: string },
): { message: string; code: DiscoveryErrorCode } {
  if (status === 401) {
    return { message: 'Sign in to Smart VMS before scanning.', code: 'unauthenticated' }
  }
  if (status === 503 && body.error === 'missing_credentials') {
    return {
      message: 'Set VAPIX password in Settings or AXIS_VAPIX_PASSWORD in web/.env.',
      code: 'missing_credentials',
    }
  }
  if (status === 403 && body.error === 'forbidden') {
    return {
      message: body.message ?? 'Administrator access required for LAN discovery.',
      code: 'scan_failed',
    }
  }
  if (status === 429) {
    return {
      message: body.message ?? 'Wait before scanning the LAN again.',
      code: 'scan_failed',
    }
  }
  return {
    message: body.message ?? `Scan failed (HTTP ${status}).`,
    code: 'scan_failed',
  }
}

function deviceFromProbe(host: string, meta: CameraMetadataProbe): DiscoveredCamera {
  return {
    id: `disc-${host.replace(/\./g, '-')}`,
    host,
    model: meta.model,
    serial: meta.serial,
    firmware: meta.firmware,
    streamProfile: meta.streamProfile,
    alreadyRegistered: false,
    selected: true,
  }
}

function withRegistration(devices: DiscoveredCamera[], registeredHosts: string[]): DiscoveredCamera[] {
  const registered = new Set(registeredHosts.map(normalizeCameraHost))
  return devices.map((d) => {
    const alreadyRegistered = registered.has(normalizeCameraHost(d.host))
    return {
      ...d,
      alreadyRegistered,
      selected: !alreadyRegistered,
    }
  })
}

export async function probeCameraMetadata(host: string): Promise<CameraMetadataProbe> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 5000)
  try {
    const res = await fetch(cameraDeviceInfoUrl(host), {
      credentials: 'same-origin',
      signal: controller.signal,
    })
    if (res.status === 401) {
      return {
        host,
        model: 'VAPIX auth failed — sign in to Smart VMS',
        serial: '—',
        firmware: '—',
      }
    }
    if (res.status === 403) {
      return {
        host,
        model: 'VAPIX auth failed — check camera password',
        serial: '—',
        firmware: '—',
      }
    }
    if (res.status === 503) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null
      if (body?.error === 'missing_credentials') {
        return {
          host,
          model: 'VAPIX credentials missing — check Settings',
          serial: '—',
          firmware: '—',
        }
      }
    }
    if (!res.ok) {
      return {
        host,
        model: 'Axis device (could not read info)',
        serial: '—',
        firmware: '—',
      }
    }
    const info = (await res.json()) as {
      model?: string
      brand?: string
      serial?: string
      firmware?: string
      streamProfile?: string
    }
    const model = info.model?.trim() || info.brand?.trim() || 'Axis device'
    return {
      host,
      model,
      serial: info.serial?.trim() || '—',
      firmware: info.firmware?.trim() || '—',
      streamProfile: info.streamProfile?.trim() || undefined,
    }
  } catch {
    return {
      host,
      model: 'Unreachable — check IP and VAPIX credentials',
      serial: '—',
      firmware: '—',
    }
  } finally {
    clearTimeout(timeout)
  }
}

interface ScanResponse {
  subnet: string
  scanned: number
  devices: CameraMetadataProbe[]
}

async function scanLan(): Promise<{
  devices: DiscoveredCamera[]
  subnet?: string
  scanned?: number
  error?: string
  errorCode?: DiscoveryErrorCode
}> {
  try {
    const res = await fetch(cameraDiscoverUrl(), { credentials: 'same-origin' })
    if (!res.ok) {
      const body = (await res.json().catch(() => ({}))) as { error?: string; message?: string }
      const mapped = mapDiscoveryHttpError(res.status, body)
      return { devices: [], error: mapped.message, errorCode: mapped.code }
    }

    const data = (await res.json()) as ScanResponse
    return {
      devices: data.devices.map((d) => deviceFromProbe(d.host, d)),
      subnet: data.subnet,
      scanned: data.scanned,
    }
  } catch {
    return {
      devices: [],
      error: 'Network error during LAN scan.',
      errorCode: 'network',
    }
  }
}

async function probeEnvSeeds(existing: DiscoveredCamera[]): Promise<DiscoveredCamera[]> {
  const known = new Set(existing.map((d) => d.host))
  const seeds = getEnvCameraHosts().filter((h) => !known.has(h))
  if (seeds.length === 0) return existing

  const extra = await Promise.all(
    seeds.map(async (host) => deviceFromProbe(host, await probeCameraMetadata(host))),
  )
  return [...existing, ...extra]
}

/**
 * Scan the LAN (/24) for Axis cameras via VAPIX, then merge any extra VITE_CAMERA_HOSTS seeds.
 */
export async function discoverCameras(registeredHosts: string[]): Promise<DiscoveryResult> {
  const scan = await scanLan()
  const devices = scan.devices

  if (devices.length === 0 && getEnvCameraHosts().length > 0) {
    const fallback = await Promise.all(
      getEnvCameraHosts().map(async (host) =>
        deviceFromProbe(host, await probeCameraMetadata(host)),
      ),
    )
    return {
      devices: withRegistration(fallback, registeredHosts),
      subnet: scan.subnet,
      scanned: scan.scanned,
      error: scan.error,
      errorCode: scan.errorCode,
    }
  }

  const merged = await probeEnvSeeds(devices)
  return {
    devices: withRegistration(merged, registeredHosts),
    subnet: scan.subnet,
    scanned: scan.scanned,
    error: scan.error,
    errorCode: scan.errorCode,
  }
}

/** @deprecated Use discoverCameras — sync stub for tests */
export function discoveryHostList(): string[] {
  const envHosts = getEnvCameraHosts()
  return envHosts.length > 0 ? envHosts : ['192.168.68.200']
}

/** @deprecated Use discoverCameras — sync stub for tests */
export function mockNetworkDiscovery(registeredHosts: string[]): DiscoveredCamera[] {
  return withRegistration(
    discoveryHostList().map((host) =>
      deviceFromProbe(host, {
        host,
        model: 'Use network scan to probe VAPIX',
        serial: '—',
        firmware: '—',
      }),
    ),
    registeredHosts,
  )
}
