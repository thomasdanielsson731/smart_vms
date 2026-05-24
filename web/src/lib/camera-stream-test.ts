export type CameraStreamTestCode =
  | 'ok'
  | 'missing_credentials'
  | 'unauthenticated'
  | 'host_not_allowed'
  | 'unreachable'
  | 'auth_failed'
  | 'camera_error'
  | 'proxy_failed'

export interface CameraStreamTestResult {
  ok: boolean
  code: CameraStreamTestCode
  message: string
  host: string
}

export function cameraStreamTestUrl(host: string): string {
  return `/api/camera/${encodeURIComponent(host)}/stream-test`
}

export async function testCameraStream(host: string): Promise<CameraStreamTestResult> {
  const res = await fetch(cameraStreamTestUrl(host), { credentials: 'same-origin' })
  const body = (await res.json().catch(() => ({}))) as Partial<
    CameraStreamTestResult & { error?: string; message?: string }
  >

  if (body.ok && body.code === 'ok') return body as CameraStreamTestResult

  const code =
    body.code ??
    (body.error === 'missing_credentials'
      ? 'missing_credentials'
      : body.error === 'unauthenticated'
        ? 'unauthenticated'
        : body.error === 'host_not_allowed'
          ? 'host_not_allowed'
          : 'proxy_failed')

  return {
    ok: false,
    host,
    code: code as CameraStreamTestCode,
    message: body.message ?? `Stream test failed (HTTP ${res.status})`,
  }
}

export function streamTestMessage(result: CameraStreamTestResult | null): string | null {
  if (!result || result.ok) return null
  switch (result.code) {
    case 'missing_credentials':
      return 'No camera password configured. Open Settings → Cameras (VAPIX) and save username + password, or set AXIS_VAPIX_USER/PASSWORD in web/.env.'
    case 'unauthenticated':
      return 'Not signed in. Log in again to view live video.'
    case 'unreachable':
      return `Cannot reach ${result.host}. Check the camera IP under Settings, ensure the camera is powered on, and that this PC is on the same network.`
    case 'auth_failed':
      return 'Camera rejected the username or password. Verify VAPIX credentials (often root + your camera password).'
    case 'host_not_allowed':
      return 'Camera IP is not on a allowed local network range.'
    default:
      return result.message
  }
}
