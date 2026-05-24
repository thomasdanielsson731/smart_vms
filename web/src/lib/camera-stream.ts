import type { Camera } from '@/types/camera'

function streamQuery(camera?: Pick<Camera, 'vapixUser'>, cacheBust?: number): string {
  const params = new URLSearchParams()
  if (camera?.vapixUser) params.set('vapixUser', camera.vapixUser)
  if (cacheBust != null) params.set('t', String(cacheBust))
  const qs = params.toString()
  return qs ? `?${qs}` : ''
}

export function mjpegStreamUrl(camera: Camera): string {
  return `/api/camera/${encodeURIComponent(camera.host)}/mjpg${streamQuery(camera)}`
}

export function snapshotStreamUrl(camera: Camera, cacheBust?: number): string {
  return snapshotStreamUrlForHost(camera.host, cacheBust, camera.vapixUser)
}

export function snapshotStreamUrlForHost(
  host: string,
  cacheBust?: number,
  vapixUser?: string,
): string {
  const params = new URLSearchParams()
  if (vapixUser) params.set('vapixUser', vapixUser)
  if (cacheBust != null) params.set('t', String(cacheBust))
  const qs = params.toString()
  const base = `/api/camera/${encodeURIComponent(host)}/snapshot`
  return qs ? `${base}?${qs}` : base
}
export function isStreamConfigured(): boolean {
  return import.meta.env.VITE_CAMERA_STREAM_ENABLED !== 'false'
}
