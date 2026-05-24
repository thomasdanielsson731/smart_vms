import type { Camera } from '@/types/camera'

const STORAGE_KEY = 'smart-vms-camera-hosts'

export function loadCameraHostOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return typeof parsed === 'object' && parsed ? parsed : {}
  } catch {
    return {}
  }
}

export function saveCameraHostOverrides(hosts: Record<string, string>): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(hosts))
}

/** Comma-separated IPs in .env override mock hosts by camera order */
function envCameraHosts(): string[] {
  const raw = (import.meta.env.VITE_CAMERA_HOSTS ?? '').trim()
  if (!raw) return []
  return raw.split(',').map((h) => h.trim()).filter(Boolean)
}

export function applyCameraHostOverrides(cameras: Camera[]): Camera[] {
  const saved = loadCameraHostOverrides()
  const fromEnv = envCameraHosts()

  return cameras.map((cam, index) => {
    const host = saved[cam.id] ?? fromEnv[index] ?? cam.host
    return host === cam.host ? cam : { ...cam, host }
  })
}

export function mergeCameraHostOverride(
  overrides: Record<string, string>,
  cameraId: string,
  host: string,
): Record<string, string> {
  const trimmed = host.trim()
  if (!trimmed) {
    const next = { ...overrides }
    delete next[cameraId]
    return next
  }
  return { ...overrides, [cameraId]: trimmed }
}
