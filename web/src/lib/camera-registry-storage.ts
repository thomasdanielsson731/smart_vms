import type { Camera } from '@/types/camera'
import { applyCameraHostOverrides, getEnvCameraHosts, normalizeCameraHost } from '@/lib/camera-hosts-storage'

const REGISTRY_KEY = 'smart-vms-camera-registry'

export interface CameraMetadataProbe {
  host: string
  model: string
  serial?: string
  firmware: string
  streamProfile?: string
}

export function loadCameraRegistry(): Camera[] | null {
  try {
    const raw = localStorage.getItem(REGISTRY_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Camera[]
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : null
  } catch {
    return null
  }
}

export function saveCameraRegistry(cameras: Camera[]): void {
  localStorage.setItem(REGISTRY_KEY, JSON.stringify(cameras))
}

/** One camera per env IP, or empty when unset. */
export function buildInitialCameras(): Camera[] {
  const stored = loadCameraRegistry()
  if (stored) {
    return applyCameraHostOverrides(stored)
  }

  const envHosts = getEnvCameraHosts()
  if (envHosts.length > 0) {
    const seeded = envHosts.map((host) => ({
      id: `cam-${host.replace(/\./g, '-')}`,
      name: `Camera ${host.split('.').pop()}`,
      location: 'Unassigned',
      host,
      model: '—',
      firmware: '—',
      status: 'online' as const,
      streamProfile: 'Sub 640×360',
      recordingEnabled: true,
      lastSeenAt: new Date().toISOString(),
    }))
    return applyCameraHostOverrides(seeded)
  }

  return []
}

export function mergeProbeMetadata(
  cameras: Camera[],
  probes: CameraMetadataProbe[],
  probedAt?: string,
): Camera[] {
  if (probes.length === 0) return cameras

  const stamp = probedAt ?? new Date().toISOString()
  const byHost = new Map(probes.map((p) => [normalizeCameraHost(p.host), p]))

  return cameras.map((cam) => {
    const probe = byHost.get(normalizeCameraHost(cam.host))
    if (!probe || isFailedProbeModel(probe.model)) return cam

    return {
      ...cam,
      model: probe.model,
      firmware: probe.firmware !== '—' ? probe.firmware : cam.firmware,
      serial: probe.serial && probe.serial !== '—' ? probe.serial : cam.serial,
      streamProfile: probe.streamProfile ?? cam.streamProfile,
      lastVapixProbeAt: stamp,
    }
  })
}

function isFailedProbeModel(model: string): boolean {
  return (
    model.includes('Unreachable') ||
    model.includes('could not read') ||
    model.includes('auth failed')
  )
}

export function probesFromDiscovered(
  discovered: Array<{
    host: string
    model: string
    serial: string
    firmware: string
    streamProfile?: string
  }>,
): CameraMetadataProbe[] {
  return discovered.map((d) => ({
    host: d.host,
    model: d.model,
    serial: d.serial,
    firmware: d.firmware,
    streamProfile: d.streamProfile,
  }))
}
