import type { CameraAcapsResponse } from '@/types/acap'

export function cameraAcapsUrl(host: string): string {
  return `/api/camera/${encodeURIComponent(host)}/acaps`
}

export async function fetchCameraAcaps(host: string): Promise<CameraAcapsResponse> {
  const res = await fetch(cameraAcapsUrl(host), { credentials: 'same-origin' })
  const body = (await res.json().catch(() => null)) as CameraAcapsResponse | { message?: string } | null
  if (!res.ok) {
    throw new Error(
      (body && 'message' in body && body.message) ||
        `Could not load ACAP list (HTTP ${res.status})`,
    )
  }
  return body as CameraAcapsResponse
}
